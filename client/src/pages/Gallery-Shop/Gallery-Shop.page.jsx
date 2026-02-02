import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import assignDynamicIds from '../../utilities/assignDynamicIds';
import { RAW_GALLERY_DATA } from './RAW_GALLERY_DATA';
import './Gallery-Shop.css';

const GALLERY_DATA = assignDynamicIds(RAW_GALLERY_DATA);

const CATEGORIES = [
  { id: 'lazy-susans', name: 'Lazy Susans', icon: '🌀' },
  { id: 'wave-cutting-boards', name: 'Wave Cutting Boards', icon: '🌊' },
  { id: 'floral', name: 'Floral Cutting Boards', icon: '🌸' },
  { id: 'scene-boards', name: 'Scene Cutting Boards', icon: '🌌' },
  { id: 'river-boards', name: 'River Boards', icon: '🦦' },
  { id: 'tables', name: 'Tables', icon: '💧' },
  // { id: 'skulls', name: 'Skulls', icon: '💀' },
  // { id: 'animals', name: 'Animals', icon: '🦅' },
  { id: 'coasters', name: 'Coasters', icon: '🍹' },
  // { id: 'bathroom-set', name: 'Bathroom Sets', icon: '🛀' },
  { id: 'holidays', name: 'Holidays', icon: '🎊' },
  { id: 'other', name: 'Other', icon: '✨' },
];

function GalleryShop({ addToCart }) {
  const navigate = useNavigate();
  
  // Load from sessionStorage or default to index 4
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(() => {
    const saved = sessionStorage.getItem('galleryCategoryIndex');
    return saved !== null ? parseInt(saved, 10) : 4;
  });
  
  const [showModal, setShowModal] = useState(false);
  const [addedItem, setAddedItem] = useState(null);

  // Save to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('galleryCategoryIndex', activeCategoryIndex);
  }, [activeCategoryIndex]);

  const activeCategory = CATEGORIES[activeCategoryIndex];
  const items = GALLERY_DATA[activeCategory.id] || [];

  const handleCategoryClick = (index) => {
    setActiveCategoryIndex(index);
  };

  const scrollCarousel = (direction) => {
    if (direction === 'left') {
      setActiveCategoryIndex((prev) => (prev === 0 ? CATEGORIES.length - 1 : prev - 1));
    } else {
      setActiveCategoryIndex((prev) => (prev === CATEGORIES.length - 1 ? 0 : prev + 1));
    }
  };

  const handleAddToCart = (item) => {
    const cartItem = {
      ...item,
      id: `gallery-${Date.now()}`,
      quantity: 1,
      type: item.availability === 'For Sale' ? 'sale' : 'order',
      category: activeCategory.name,
      imageUrl: item.image,
      image: item.image,
      description: `${activeCategory.name} - ${item.name}`,
      isCustom: false,
      totalPrice: item.price,
      availability: item.availability,
    };
    
    addToCart(cartItem);
    setAddedItem(item);
    setShowModal(true);
  };

  const handleContinueShopping = () => {
    setShowModal(false);
    setAddedItem(null);
  };

  const handleCheckoutNow = () => {
    setShowModal(false);
    navigate('/checkout');
  };

  return (
    <div className="gallery-page">
      <div className="gallery-header">
        <h1>Our Gallery</h1>
        <p>Browse our collection of handcrafted woodwork</p>
        <br/>
        <p><strong>For Sale & By Order Only</strong> </p><br/> <p> BUY NOW items are already made and ready to be shipped.</p> <br/>
        <p> ORDER NOW items are not made yet and will require more time until it reaches you.  </p>
        
      </div>

      {/* Category Carousel */}
      <div className="carousel-container">
        <button className="carousel-arrow left" onClick={() => scrollCarousel('left')}>
          &#8249;
        </button>

        <div className="carousel">
          {CATEGORIES.map((category, index) => {
            const position = index - activeCategoryIndex;
            const isCenter = position === 0;
            const isVisible = Math.abs(position) <= 2;

            return (
              <div
                key={category.id}
                className={`carousel-item ${isCenter ? 'center' : ''} ${!isVisible ? 'hidden' : ''}`}
                style={{
                  transform: `translateX(${position * 150}px) scale(${isCenter ? 1.2 : 0.8})`,
                  opacity: isVisible ? (isCenter ? 1 : 0.5) : 0,
                  zIndex: isCenter ? 10 : 1,
                }}
                onClick={() => handleCategoryClick(index)}
              >
                <div className="category-icon">{category.icon}</div>
                <div className="category-name">{category.name}</div>
              </div>
            );
          })}
        </div>

        <button className="carousel-arrow right" onClick={() => scrollCarousel('right')}>
          &#8250;
        </button>
      </div>

      {/* Items Grid */}
      <div className="items-section">
        <h2>{activeCategory.name}</h2>
        {items.length === 0 ? (
          <p className="no-items">No items available in this category yet.</p>
        ) : (
          <div className="items-grid">
            {items.map((item) => (
              <div
                key={item.id}
                className="item-card"
                onClick={() => navigate('/item-detail', {
                  state: {
                    item: item,
                    category: activeCategory.name,
                  }
                })}
                style={{ cursor: 'pointer' }}
              >
                <div className="item-image-container">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading='lazy'
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23e8e8e8" width="300" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E' + item.name + '%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  {/* Availability Tag */}
                  <div className={`availability-tag ${item.availability === 'For Sale' ? 'tag-sale' : 'tag-order'}`}>
                    {item.availability}
                  </div>
                </div>
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-price">${item.price}</p>
                  <button
                    className="add-to-cart-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(item);
                    }}
                  >
                    {item.availability === 'For Sale' ? 'Buy Now' : 'Order And Pay Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleContinueShopping}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">✓</div>
            <h2>Item Added to Shopping Cart</h2>
            {addedItem && (
              <>
                <p className="modal-item-name">{addedItem.name} - ${addedItem.price}</p>
                <p className="modal-availability">
                  {addedItem.availability === 'For Sale' 
                    ? 'Ready to ship!' 
                    : 'Will be added to build queue'}
                </p>
              </>
            )}
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

export default GalleryShop;