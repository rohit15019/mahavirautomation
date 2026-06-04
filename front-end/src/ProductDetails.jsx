import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProducts } from './productsData';
import './ProductDetails.css';

import workflowImg from './assets/workflow.png';
import dataSyncImg from './assets/datasync.png';
import teamImg from './assets/team.png';

const imageMap = {
  workflow: workflowImg,
  datasync: dataSyncImg,
  team: teamImg
};

const getImageUrl = (imageKey) => {
  if (!imageKey) return workflowImg;
  if (imageKey.startsWith('/')) return `${import.meta.env.VITE_API_BASE_URL}${imageKey}`;
  return imageMap[imageKey] || workflowImg;
};

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const allProducts = await getProducts();
      const foundProduct = allProducts.find(p => String(p.id || p.Id) === String(productId));
      setProduct(foundProduct);
      setLoading(false);
    };
    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="product-details-loading">
        <div className="loader"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-not-found">
        <h2>Product Not Found</h2>
        <button onClick={() => navigate('/products')} className="back-btn">Back to Products</button>
      </div>
    );
  }

  // Use dynamic detailed features or fallback to generated ones
  const detailedFeatures = (product.detailedFeatures && product.detailedFeatures.length > 0)
    ? product.detailedFeatures.map((feat) => ({
        title: feat.title,
        description: feat.description,
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="#00b4d8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      }))
    : product.features.map((feature) => ({
        title: feature,
        description: `Experience the power of ${feature.toLowerCase()}. Enhance your productivity, streamline your workflow, and achieve unprecedented efficiency with this core capability. Designed specifically for modern automation requirements, it delivers robust performance and seamless integration.`,
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="#00b4d8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      }));

  const files = product.filesMetadata || [];

  const handleDownload = async (filePath, fileName) => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/register');
      return;
    }

    if (product && (product.id || product.Id)) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1.0/Product/${product.id || product.Id}/download-file?filePath=${encodeURIComponent(filePath)}`);
        if (!response.ok) throw new Error('Download failed');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName || 'product-download';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Error downloading file:', error);
        alert('Failed to download file. Please try again.');
      }
    }
  };

  return (
    <div className="product-details-page">
      <div className="product-details-content">
        {/* Left Column: Detailed Features */}
        <div className="product-details-left">
          {detailedFeatures.map((feat, idx) => (
            <div key={idx} className="detailed-feature-block">
              <div className="detailed-feature-header">
                <span className="feature-icon">{feat.icon}</span>
                <h3>{feat.title}</h3>
              </div>
              <p>{feat.description}</p>
              
              {/* Mock sub-images removed per user request */}

            </div>
          ))}
        </div>

        {/* Right Column: Sticky Product Hero */}
        <div className="product-details-right">
          <div className="sticky-container">
            <h1 className="hero-title">{product.title}: Comprehensive Solutions</h1>
            
            <p className="hero-subtitle" style={{ color: '#555', marginBottom: '30px', fontSize: '1.1rem', fontStyle: 'italic' }}>
              Discover how {product.title} can transform your operations with state-of-the-art automation and seamless integration.
            </p>

            <div className="hero-image-wrapper">
              <img 
                src={getImageUrl(product.imageKey)} 
                alt={product.title} 
                className="hero-main-image"
              />
            </div>

            <div className="download-section">
              {files.length > 0 ? (
                files.map((file, idx) => (
                  <div key={idx} style={{ marginBottom: '20px' }}>
                    <button className="download-full-btn" onClick={() => handleDownload(file.filePath, file.fileName)}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      DOWNLOAD {file.fileName.toUpperCase()}
                    </button>
                    <div className="file-metadata">
                      <p><strong>File name:</strong> {file.fileName}</p>
                      <p><strong>File size:</strong> {file.fileSize}</p>
                      <p><strong>Last Updated:</strong> {file.lastUpdated}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="file-metadata" style={{ textAlign: 'center', opacity: 0.7 }}>
                  <p>Contact support for product resources.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
