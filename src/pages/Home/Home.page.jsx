import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to 4everLilys Wood Crafts</h1>
          <p className="hero-subtitle">
            Handcrafted wooden gifts made with love and care
          </p>
          <p className="hero-description">
            Create your perfect personalized gift with our custom builder. 
            Choose from a variety of beautiful wooden crafts, select your 
            preferred size and colors, and we'll handcraft it just for you.
          </p>
          <Link to="/build-custom" className="cta-button">
            Build Your Custom Woodcrafted Gift
          </Link>
        </div>
      </section>

      <section className="features-section">
        <div className="features-container">
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Custom Designs</h3>
            <p>Choose from multiple gift options and customize every detail</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📏</div>
            <h3>Multiple Sizes</h3>
            <p>Select the perfect size for your gift from our range of options</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌈</div>
            <h3>Color Options</h3>
            <p>Pick your favorite colors to make your gift truly unique</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h3>Handcrafted Quality</h3>
            <p>Each piece is carefully crafted with attention to detail</p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="about-content">
          <h2>Why Choose 4everLilys?</h2>
          <p>
            At 4everLilys Wood Crafts, we believe in creating more than just products – 
            we create memories. Every piece is handcrafted with premium materials and 
            personalized to your specifications. Whether it's a gift for a loved one or 
            a special treat for yourself, our custom wooden crafts are made to last forever.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Home;