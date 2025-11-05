import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = () => (
  <div className="spinner-overlay">
    <img src="/heart.png" alt="Loading..." className="spinner-image" />
  </div>
);

export default LoadingSpinner;