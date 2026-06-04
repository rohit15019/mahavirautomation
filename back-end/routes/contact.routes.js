const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/contact.model');
const { authenticateUser, authorizeAdmin } = require('../middleware/auth.middleware');

// @route   POST /api/v1.0/Contact/send
// @desc    Send a contact message
router.post('/send', async (req, res) => {
  try {
    const { name, email, mobile, inquiryType, message } = req.body;

    if (!name || !email || !mobile || !inquiryType || !message) {
      return res.status(400).json({ message: 'All fields (name, email, mobile, inquiryType, message) are required.' });
    }

    const newMessage = new ContactMessage({
      name,
      email,
      mobile,
      inquiryType,
      message,
      status: 'Pending'
    });

    await newMessage.save();
    
    // Send email notification to admin
    const sendEmail = require('../utils/emailService');
    const adminMessage = `New Contact Inquiry:\n\nName: ${name}\nEmail: ${email}\nMobile: ${mobile}\nInquiry Type: ${inquiryType}\nMessage: \n${message}`;
    
    try {
      await sendEmail({
        email: process.env.EMAIL_USER, // sending to admin email
        subject: `New Contact Inquiry: ${inquiryType}`,
        message: adminMessage,
      });
    } catch (emailError) {
      console.error('Error sending contact notification email:', emailError);
    }

    res.status(201).json({ message: 'Message sent successfully! We will get back to you soon.', data: newMessage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/v1.0/Contact/messages
// @desc    Get all contact messages (Admin only)
router.get('/messages', authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/v1.0/Contact/messages/:id/status
// @desc    Update contact message status (Admin only)
router.put('/messages/:id/status', authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Support BOTH JSON object e.g. {"status": "Resolved"} OR a raw string "Resolved"
    let status;
    if (typeof req.body === 'string') {
      status = req.body;
    } else if (req.body && req.body.status) {
      status = req.body.status;
    } else if (req.body) {
      // Fallback: try parsing body if sent as raw text that Express parsed as object keys
      const keys = Object.keys(req.body);
      if (keys.length > 0) {
        status = keys[0];
      }
    }

    if (!status || !['Pending', 'Resolved'].includes(status)) {
      return res.status(400).json({ message: 'Valid status (Pending or Resolved) is required.' });
    }

    const message = await ContactMessage.findOne({ id: parseInt(id) });
    if (!message) {
      return res.status(404).json({ message: 'Message inquiry not found.' });
    }

    message.status = status;
    await message.save();

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/v1.0/Contact/messages/:id
// @desc    Delete a contact message (Admin only)
router.delete('/messages/:id', authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ContactMessage.deleteOne({ id: parseInt(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Message inquiry not found.' });
    }

    res.json({ message: 'Message inquiry deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
