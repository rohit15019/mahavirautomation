import React, { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, Trash2, CheckCircle, Clock, Search, Filter, Eye, X } from 'lucide-react';
import './AdminManagement.css';

const AdminRequests = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedMessage, setSelectedMessage] = useState(null);

  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1.0/Contact/messages`;

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  }

  const updateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1.0/Contact/messages/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newStatus)
      });

      if (response.ok) {
        fetchMessages();
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage({ ...selectedMessage, status: newStatus });
        }
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1.0/Contact/messages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchMessages();
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  const filteredMessages = messages.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'All' || m.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) return <div className="admin-loading">Loading Inquiries...</div>;

  return (
    <div className="admin-management-container">
      <div className="management-header">
        <div>
          <h2>Customer Inquiries</h2>
          <p>Manage and respond to messages from your customers</p>
        </div>
        
        <div className="search-box" style={{ display: 'flex', gap: '1rem', width: 'auto' }}>
            <div style={{ position: 'relative' }}>
                <input 
                    type="text" 
                    placeholder="Search inquiries..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="modern-input"
                    style={{ paddingLeft: '2.5rem', width: '250px' }}
                />
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
            </div>
            
            <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="modern-select"
                style={{ width: '150px' }}
            >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
            </select>
        </div>
      </div>

      <div className="management-list-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Inquiry Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMessages.length > 0 ? (
              filteredMessages.map(msg => (
                <tr key={msg.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>
                      <Calendar size={14} />
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '200px' }}>
                      <span className="break-word" style={{ fontWeight: '600', color: 'white' }}>{msg.name}</span>
                      <span className="break-word" style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>{msg.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className="root-badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
                        {msg.inquiryType}
                    </span>
                  </td>
                  <td>
                    <span className={`page-btn ${msg.status === 'Pending' ? '' : 'active'}`} 
                          style={{ 
                              padding: '2px 8px', 
                              height: 'auto', 
                              fontSize: '0.75rem',
                              background: msg.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                              color: msg.status === 'Pending' ? '#f59e0b' : '#10b981',
                              borderColor: msg.status === 'Pending' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                              cursor: 'default',
                              boxShadow: 'none'
                          }}>
                      {msg.status === 'Pending' ? <Clock size={12} style={{marginRight: '4px'}} /> : <CheckCircle size={12} style={{marginRight: '4px'}} />}
                      {msg.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="edit-btn" onClick={() => setSelectedMessage(msg)} title="View Details"><Eye size={16} /></button>
                      <button className="delete-btn" onClick={() => deleteMessage(msg.id)} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-results">No inquiries found matching your criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Message Modal */}
      {selectedMessage && (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center',
            alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)',
            overflowY: 'auto', padding: '2rem 0'
        }}>
            <div className="management-card" style={{ width: '600px', maxWidth: '95vw', position: 'relative', border: '1px solid var(--admin-accent)', overflow: 'hidden' }}>
                <button 
                    onClick={() => setSelectedMessage(null)}
                    style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', color: 'var(--admin-text-muted)', cursor: 'pointer' }}
                >
                    <X size={24} />
                </button>

                <h2 style={{ marginBottom: '20px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '15px' }}>
                    Inquiry Details
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                    <div>
                        <label style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Customer</label>
                        <p style={{ fontSize: '1.1rem', fontWeight: '600', color: 'white' }}>{selectedMessage.name}</p>
                    </div>
                    <div>
                        <label style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Type</label>
                        <p style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--admin-accent)' }}>{selectedMessage.inquiryType}</p>
                    </div>
                    <div>
                        <label style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Email</label>
                        <p className="break-word" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                            <Mail size={16} color="var(--admin-accent)" style={{ flexShrink: 0 }} /> {selectedMessage.email}
                        </p>
                    </div>
                    <div>
                        <label style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Mobile</label>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                            <Phone size={16} color="var(--admin-accent)" /> {selectedMessage.mobile}
                        </p>
                    </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid var(--admin-border)', marginBottom: '25px' }}>
                    <label style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Message</label>
                    <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '10px' }}>
                        <p className="break-word" style={{ color: '#f8fafc', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{selectedMessage.message}</p>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {selectedMessage.status === 'Pending' ? (
                            <button onClick={() => updateStatus(selectedMessage.id, 'Resolved')} className="submit-btn" style={{ background: '#10b981', color: 'white', padding: '10px 20px' }}>
                                <CheckCircle size={18} style={{marginRight: '8px'}} /> Mark as Resolved
                            </button>
                        ) : (
                            <button onClick={() => updateStatus(selectedMessage.id, 'Pending')} className="btn-secondary" style={{ padding: '10px 20px' }}>
                                <Clock size={18} style={{marginRight: '8px'}} /> Revert to Pending
                            </button>
                        )}
                    </div>
                    <button onClick={() => deleteMessage(selectedMessage.id)} className="delete-btn" style={{ padding: '10px 20px', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Trash2 size={18} /> Delete Request
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminRequests;
