import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';
import logo from './assets/logo.png';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="footer-logo">
            <img src={logo} alt="Mahavir Automation" className="footer-logo-img" />
          </div>
          <p className="footer-description">
            Streamlining business operations through intelligent automation solutions.
          </p>
        </div>

        <div className="footer-links-group">
          <h4 className="footer-heading">QUICK LINKS</h4>
          <ul className="footer-list">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/about">About us</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>

        <div className="footer-contact-group">
          <h4 className="footer-heading">CONTACT</h4>
          <ul className="footer-list">
            <li>
              <span className="icon">✉</span> mahavirautomation111@gmail.com
            </li>
            <li>
              <span className="icon">📞</span> +91 97237 73000
            </li>
            <li>
              <span className="icon">📍</span> Morbi, Gujarat
            </li>
          </ul>
        </div>

        <div className="footer-social-group">
          <h4 className="footer-heading">FOLLOW US</h4>
          <div className="social-icons">
            <div className="social-icon">In</div>
            <div className="social-icon">Tw</div>
            <div className="social-icon">Fb</div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="copyright">&copy; 2026 Mahavir Automation. All rights reserved.</p>
        <div className="footer-legal">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
