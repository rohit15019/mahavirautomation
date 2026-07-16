import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Products.css';
import workflowImg from './assets/workflow.png';
import dataSyncImg from './assets/datasync.png';
import teamImg from './assets/team.png';
import headerImg from './assets/product_hero.png';
import { getProducts } from './productsData';

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

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categoryName, setCategoryName] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const allProducts = await getProducts();
      setProducts(allProducts);
      
      const queryParams = new URLSearchParams(location.search);
      const categoryId = queryParams.get('category');
      
      if (categoryId) {
        setFilteredProducts(allProducts.filter(p => String(p.categoryId) === String(categoryId)));
        
        // Fetch category name
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/category?type=Product`);
          if (response.ok) {
            const categories = await response.json();
            const cat = categories.find(c => String(c.id || c.Id) === String(categoryId));
            if (cat) setCategoryName(cat.name || cat.Name);
          }
        } catch (error) {
          console.error('Error fetching categories:', error);
        }
      } else {
        setFilteredProducts(allProducts);
        setCategoryName(null);
      }
    };
    loadData();
  }, [location.search]);

  return (
    <div className="products-page">
      <div className="products-header">
        <div className="products-header-content">
          <div className="products-badge">✨ Premium Industrial Solutions</div>
          <h1>
            Advanced Industrial <span className="highlight-text">Automation Solutions</span>
          </h1>
          <p className="primary-desc">
            Mahavir Automation provides high-performance industrial automation products designed for reliability, accuracy, and long-term stability. Our solutions include PLC systems, HMI interfaces, servo drives, VFDs, sensors, and complete control panel solutions tailored for modern industries.
          </p>
          <p className="secondary-desc">
            With a focus on precision control and smart automation, our products help improve machine efficiency, reduce downtime, and enhance production quality. Whether you need simple machine control or a complex automated system, we deliver customized solutions according to your application.
          </p>
          <div className="products-header-actions">
            <button className="btn btn-primary" onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}>View Products</button>
            <button className="btn btn-outline" onClick={() => navigate('/contact')}>Contact Sales</button>
          </div>
        </div>
        <div className="products-header-image">
          <div className="image-glow"></div>
          <img src={headerImg} alt="Mahavir Automation Products" />
        </div>
      </div>

      <div className="products-container">
        <div className="products-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-image-container">
              <img src={getImageUrl(product.imageKey)} alt={product.title} className="product-image" />
            </div>
            <div className="product-content">
              <h2 className="product-title">{product.title}</h2>
              <p className="product-description">{product.description}</p>
              
              <ul className="product-features">
                {product.features.slice(0, 1).map((feature, index) => (
                  <li key={index}>
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="#00b4d8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="feature-text">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="product-pricing">
                <span className="price-amount">₹{product.price}</span>
              </div>
              
              <button 
                className="get-started-btn"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                Get started
              </button>
            </div>
          </div>
        ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="no-products">
            <p>No products found in this category yet.</p>
          </div>
        )}
      </div>

      {/* Consultation Section */}
      <div className="consultation-section">
        <h2>Not sure which product you need?</h2>
        <p>Schedule a free consultation with our automation experts. We'll analyze your needs and recommend the best approach.</p>
        <button className="book-consultation-btn" onClick={() => navigate('/contact')}>Book a consultation</button>
      </div>
    </div>
  );
};

export default Products;
