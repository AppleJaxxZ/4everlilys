import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CustomBuilder.css';

// TEMPLATE DATA - Easily customizable
const GIFTS = [
  { id: 1, name: 'Gift 1', image: '/images/gifts/gift1.jpg', basePrice: 25 },
  { id: 2, name: 'Gift 2', image: '/images/gifts/gift2.jpg', basePrice: 30 },
  { id: 3, name: 'Gift 3', image: '/images/gifts/gift3.jpg', basePrice: 35 },
  { id: 4, name: 'Gift 4', image: '/images/gifts/gift4.jpg', basePrice: 28 },
  { id: 5, name: 'Gift 5', image: '/images/gifts/gift5.jpg', basePrice: 32 },
  { id: 6, name: 'Gift 6', image: '/images/gifts/gift6.jpg', basePrice: 40 },
  { id: 7, name: 'Gift 7', image: '/images/gifts/gift7.jpg', basePrice: 27 },
  { id: 8, name: 'Gift 8', image: '/images/gifts/gift8.jpg', basePrice: 33 },
  { id: 9, name: 'Gift 9', image: '/images/gifts/gift9.jpg', basePrice: 38 },
  { id: 10, name: 'Gift 10', image: '/images/gifts/gift10.jpg', basePrice: 45 }
];

const SIZES = [
  { id: 1, name: 'Small', image: '/images/sizes/small.jpg', priceModifier: 0 },
  { id: 2, name: 'Medium', image: '/images/sizes/medium.jpg', priceModifier: 10 },
  { id: 3, name: 'Large', image: '/images/sizes/large.jpg', priceModifier: 20 },
  { id: 4, name: 'Extra Large', image: '/images/sizes/xlarge.jpg', priceModifier: 30 }
];

const COLORS = [
  { id: 1, name: 'Natural Wood', hex: '#DEB887', priceModifier: 0 },
  { id: 2, name: 'Dark Walnut', hex: '#654321', priceModifier: 5 },
  { id: 3, name: 'Cherry Red', hex: '#8B0000', priceModifier: 5 },
  { id: 4, name: 'Ocean Blue', hex: '#4682B4', priceModifier: 5 },
  { id: 5, name: 'Forest Green', hex: '#228B22', priceModifier: 5 },
  { id: 6, name: 'Sunset Orange', hex: '#FF8C00', priceModifier: 5 },
  { id: 7, name: 'Royal Purple', hex: '#6A0DAD', priceModifier: 5 },
  { id: 8, name: 'Ivory White', hex: '#FFFFF0', priceModifier: 5 }
];

function CustomBuilder({ addToCart }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedGift, setSelectedGift] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColors, setSelectedColors] = useState([]);
  const [quantity, setQuantity] = useState(1);

  const handleGiftSelect = (gift) => {
    setSelectedGift(gift);
    setStep(2);
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setStep(3);
  };

  const handleColorToggle = (color) => {
    if (selectedColors.find(c => c.id === color.id)) {
      setSelectedColors(selectedColors.filter(c => c.id !== color.id));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const handleContinueToReview = () => {
    if (selectedColors.length > 0) {
      setStep(4);
    } else {
      alert('Please select at least one color');
    }
  };

  const calculateTotalPrice = () => {
    if (!selectedGift || !selectedSize) return 0;
    
    const basePrice = selectedGift.basePrice;
    const sizePrice = selectedSize.priceModifier;
    const colorPrice = selectedColors.reduce((sum, color) => sum + color.priceModifier, 0);
    
    return (basePrice + sizePrice + colorPrice) * quantity;
  };

  const handleAddToCart = () => {
    const item = {
      gift: selectedGift,
      size: selectedSize,
      colors: selectedColors,
      quantity: quantity,
      totalPrice: calculateTotalPrice()
    };
    addToCart(item);
    alert('Item added to cart!');
    navigate('/checkout');
  };

  const goToStep = (stepNumber) => {
    setStep(stepNumber);
  };

  return (
    <div className="custom-builder-container">
      <div className="progress-bar">
        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Choose Gift</div>
        </div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Choose Size</div>
        </div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Choose Colors</div>
        </div>
        <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>
          <div className="step-number">4</div>
          <div className="step-label">Review</div>
        </div>
      </div>

      <div className="builder-content">
        {/* STEP 1: Choose Gift */}
        {step === 1 && (
          <div className="step-container">
            <h2 className="step-title">Step 1: Choose Your Gift</h2>
            <div className="gifts-grid">
              {GIFTS.map(gift => (
                <div 
                  key={gift.id} 
                  className="gift-card"
                  onClick={() => handleGiftSelect(gift)}
                >
                  <div className="gift-image-container">
                    <img 
                      src={gift.image} 
                      alt={gift.name}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E' + gift.name + '%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                  <h3>{gift.name}</h3>
                  <p className="price">Starting at ${gift.basePrice}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Choose Size */}
        {step === 2 && (
          <div className="step-container">
            <h2 className="step-title">Step 2: Choose Your Size</h2>
            <div className="selected-info">
              <p>Selected Gift: <strong>{selectedGift.name}</strong></p>
            </div>
            <div className="sizes-grid">
              {SIZES.map(size => (
                <div 
                  key={size.id} 
                  className="size-card"
                  onClick={() => handleSizeSelect(size)}
                >
                  <div className="size-image-container">
                    <img 
                      src={size.image} 
                      alt={size.name}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e8e8e8" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E' + size.name + '%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                  <h3>{size.name}</h3>
                  <p className="price">
                    {size.priceModifier > 0 ? `+$${size.priceModifier}` : 'No extra charge'}
                  </p>
                </div>
              ))}
            </div>
            <button className="back-button" onClick={() => goToStep(1)}>
              ← Back to Gifts
            </button>
          </div>
        )}

        {/* STEP 3: Choose Colors */}
        {step === 3 && (
          <div className="step-container">
            <h2 className="step-title">Step 3: Select Colors (Choose one or more)</h2>
            <div className="selected-info">
              <p>Selected Gift: <strong>{selectedGift.name}</strong></p>
              <p>Selected Size: <strong>{selectedSize.name}</strong></p>
            </div>
            <div className="colors-grid">
              {COLORS.map(color => (
                <div 
                  key={color.id} 
                  className={`color-card ${selectedColors.find(c => c.id === color.id) ? 'selected' : ''}`}
                  onClick={() => handleColorToggle(color)}
                >
                  <div 
                    className="color-swatch" 
                    style={{ backgroundColor: color.hex }}
                  ></div>
                  <h3>{color.name}</h3>
                  <p className="price">
                    {color.priceModifier > 0 ? `+$${color.priceModifier}` : 'Included'}
                  </p>
                  {selectedColors.find(c => c.id === color.id) && (
                    <div className="checkmark">✓</div>
                  )}
                </div>
              ))}
            </div>
            <div className="button-group">
              <button className="back-button" onClick={() => goToStep(2)}>
                ← Back to Sizes
              </button>
              <button className="continue-button" onClick={handleContinueToReview}>
                Continue to Review →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Review and Quantity */}
        {step === 4 && (
          <div className="step-container review-container">
            <h2 className="step-title">Step 4: Review Your Selection</h2>
            
            <div className="review-summary">
              <div className="review-section">
                <h3>Gift</h3>
                <p><strong>{selectedGift.name}</strong></p>
                <p className="price-detail">Base Price: ${selectedGift.basePrice}</p>
                <button className="edit-button" onClick={() => goToStep(1)}>
                  Edit
                </button>
              </div>

              <div className="review-section">
                <h3>Size</h3>
                <p><strong>{selectedSize.name}</strong></p>
                <p className="price-detail">
                  {selectedSize.priceModifier > 0 ? `+$${selectedSize.priceModifier}` : 'Included'}
                </p>
                <button className="edit-button" onClick={() => goToStep(2)}>
                  Edit
                </button>
              </div>

              <div className="review-section">
                <h3>Colors</h3>
                <div className="selected-colors-list">
                  {selectedColors.map(color => (
                    <div key={color.id} className="color-review-item">
                      <div 
                        className="color-preview" 
                        style={{ backgroundColor: color.hex }}
                      ></div>
                      <span>{color.name}</span>
                      <span className="price-detail">
                        {color.priceModifier > 0 ? `+$${color.priceModifier}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="edit-button" onClick={() => goToStep(3)}>
                  Edit
                </button>
              </div>

              <div className="review-section quantity-section">
                <h3>Quantity</h3>
                <div className="quantity-controls">
                  <button 
                    className="quantity-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <span className="quantity-display">{quantity}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="total-price-section">
                <h2>Total Price: ${calculateTotalPrice()}</h2>
              </div>
            </div>

            <div className="button-group">
              <button className="back-button" onClick={() => navigate('/')}>
                ← Back to Home
              </button>
              <button className="add-to-cart-button" onClick={handleAddToCart}>
                Add to Cart & Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomBuilder;