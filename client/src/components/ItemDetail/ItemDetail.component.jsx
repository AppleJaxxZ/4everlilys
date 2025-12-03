import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ItemDetail.css';

function ItemDetail({ addToCart }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { item, category, section } = location.state || {};
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // If no item data, redirect back
  if (!item) {
    navigate(-1);
    return null;
  }

  // Get all images for this item (main image + additional images if available)
  const images = item.images || [item.image];

  const handleAddToCart = () => {
    const cartItem = {
      ...item,
      id: `gallery-${Date.now()}`,
      quantity: quantity,
      type: section === 'available-order' ? 'order' : 'sale',
      category: category,
      imageUrl: item.image,
      image: item.image,
      description: `${category} - ${item.name}`,
      isCustom: false,
      totalPrice: item.price,
    };
    
    addToCart(cartItem);
    setShowModal(true);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // Small delay to show modal, then go to checkout
    setTimeout(() => {
      navigate('/checkout');
    }, 800);
  };

  const handleContinueShopping = () => {
    setShowModal(false);
    navigate('/gallery-shop');
  };

  const handleCheckoutNow = () => {
    setShowModal(false);
    navigate('/checkout');
  };

  return (
    <div className="item-detail-page">
      <div className="item-detail-container">
        {/* Back Button */}
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back to Gallery
        </button>

        <div className="item-detail-content">
          {/* Left Side - Images */}
          <div className="item-images-section">
            {/* Main Image */}
            <div className="main-image-container">
              <img
                src={images[selectedImageIndex]}
                alt={item.name}
                className="main-image"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="500"%3E%3Crect fill="%23e8e8e8" width="500" height="500"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>

            {/* Thumbnail Gallery (if multiple images) */}
            {images.length > 1 && (
              <div className="thumbnail-gallery">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={img}
                      alt={`${item.name} view ${index + 1}`}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23e8e8e8" width="80" height="80"/%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Details */}
          <div className="item-details-section">
            <div className="item-info">
              {/* Category Badge */}
              <div className="category-badge">
                {category}
              </div>

              {/* Item Name */}
              <h1 className="item-title">{item.name}</h1>

              {/* Availability Badge */}
              <div className={`availability-badge ${section === 'available-order' ? 'made-to-order' : 'in-stock'}`}>
                {section === 'available-order' ? '📦 Made to Order' : '✓ Ready to Ship'}
              </div>

              {/* Price */}
              <div className="item-price-section">
                <span className="price-label">Price:</span>
                <span className="price-amount">${item.price.toFixed(2)}</span>
              </div>

              {/* Description */}
              <div className="item-description">
                <h3>About this item</h3>
                <p>{item.description || `Handcrafted ${item.name.toLowerCase()} made with premium materials. Each piece is unique and made with attention to detail.`}</p>
                
                <ul className="item-features">
                  <li>✓ Handcrafted in Pennsylvania</li>
                  <li>✓ Premium quality materials</li>
                  <li>✓ Unique design</li>
                  {section === 'available-order' && <li>⏱ Custom made: 2-4 weeks</li>}
                  {section === 'for-sale' && <li>🚚 Ships in 3-5 business days</li>}
                </ul>
              </div>

              {/* Quantity Selector */}
              <div className="quantity-section">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="qty-display">{quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button className="add-to-cart-btn" onClick={handleAddToCart}>
                  Add to Cart
                </button>
                <button className="buy-now-btn" onClick={handleBuyNow}>
                  Buy Now
                </button>
              </div>

              {/* Additional Info */}
              <div className="additional-info">
                <div className="info-item">
                  <strong>🚚 Shipping:</strong>
                  <span>Free shipping on orders over $100</span>
                </div>
                <div className="info-item">
                  <strong>↩️ Returns:</strong>
                  <span>NO RETURNS!  Items are shipped without defect and packed to withstand shipping damage </span>
                </div>
                <div className="info-item">
                  <strong>✓ Quality:</strong>
                  <span>Handcrafted with care in Pennsylvania, USA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleContinueShopping}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">✔</div>
            <h2>Added to Cart!</h2>
            <p className="modal-item-name">
              {quantity}x {item.name} - ${(item.price * quantity).toFixed(2)}
            </p>
            <div className="modal-buttons">
              <button className="continue-btn" onClick={handleContinueShopping}>
                Continue Shopping
              </button>
              <button className="checkout-btn" onClick={handleCheckoutNow}>
                Checkout Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemDetail;