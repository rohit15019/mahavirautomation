import React from 'react';
import './Home.css';
import { Link } from 'react-router-dom';
import heroImg from './assets/hero_office_worker.png';

const Home = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Automate your business, amplify your growth</h1>
          <p className="hero-subtitle">
            Stop wasting time on manual processes. Mahavir Automation helps you build, deploy, and scale intelligent workflows that work while you sleep.
          </p>
          <div className="hero-buttons">
            <Link to="/products" className="btn btn-primary">Explore products &rarr;</Link>

          </div>
        </div>
        <div className="hero-image-wrapper">
          <img src={heroImg} alt="Professional working on laptop" className="hero-image" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-header">
          <h2>Why teams choose Mahavir Automation</h2>
          <p>Built for modern businesses that need speed, reliability, and results.</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon icon-blue">⚡</div>
            <h3>Lightning-fast automation</h3>
            <p>Deploy workflows in minutes, not weeks. Our platform handles the complexity while you focus on results.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon icon-teal">⏱️</div>
            <h3>Save 47% of your time</h3>
            <p>Automate repetitive tasks and free your team to work on what matters. Real productivity gains, measured and proven.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon icon-green">🛡️</div>
            <h3>Enterprise-grade security</h3>
            <p>Bank-level encryption, SOC 2 compliance, and granular access controls keep your data protected.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon icon-cyan">📈</div>
            <h3>Scale without limits</h3>
            <p>From 10 to 10,000 workflows, our infrastructure grows with your business needs seamlessly.</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
