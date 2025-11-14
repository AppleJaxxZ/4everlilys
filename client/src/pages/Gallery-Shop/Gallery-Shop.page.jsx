import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import assignDynamicIds from '../../utilities/assignDynamicIds';
import './Gallery-Shop.css';


// Mock data for gallery items
const RAW_GALLERY_DATA = {
  'available-order': {
    'lazy-susans': [
      { name: 'Acacia Lazy Susan 9"', price: 50, image: '/images/gallery/lazy1.jpg' },
      { name: 'Acacia Lazy Susan 11"', price: 120, image: '/images/gallery/lazy2.jpg' },
      { name: 'Acacia Lazy Susan 12"', price: 150, image: '/images/gallery/lazy3.jpg' },
      { name: 'Lazy Susan 14"', price: 120, image: '/images/gallery/lazy2.jpg' },
      { name: 'Lazy Susan 15"', price: 150, image: '/images/gallery/lazy3.jpg' },
      { name: ' Lazy Susan 20"', price: 120, image: '/images/gallery/lazy2.jpg' },
      
    ],
    'cutting-boards': [
      { name: 'Black Walnut 11" x 8 " ', price: 65, image: '/images/gallery/board1.jpg' },
      { name: 'Black Walnut 14" x 8"', price: 95, image: '/images/gallery/board2.jpg' },
      { name: 'Black Walnut 19" x 10" ', price: 75, image: '/images/gallery/board3.jpg' },
      { name: 'Black Walnut 24" x 12"', price: 95, image: '/images/gallery/board2.jpg' },
      { name: 'Black Walnut 32" x 8.5" ', price: 75, image: '/images/gallery/board3.jpg' },
      { name: 'Maple Walnut 11" x 8 " ', price: 65, image: '/images/gallery/board1.jpg' },
      { name: 'Maple Walnut 14" x 8"', price: 95, image: '/images/gallery/board2.jpg' },
      { name: 'Maple Walnut 19" x 10" ', price: 75, image: '/images/gallery/board3.jpg' },
      { name: 'Maple Walnut 24" x 12"', price: 95, image: '/images/gallery/board2.jpg' },
      { name: 'Maple Walnut 32" x 8.5" ', price: 75, image: '/images/gallery/board3.jpg' },
    ],
    'tables': [
      { name: 'Coffee Table', price: 450, image: '/images/gallery/table1.jpg' },
      { name: 'Side Table', price: 280, image: '/images/gallery/table2.jpg' },
    ],
    'trays': [
      { name: 'Serving Tray Large', price: 55, image: '/images/gallery/tray1.jpg' },
      { name: 'Breakfast Tray', price: 45, image: '/images/gallery/tray2.jpg' },
    ],
    'river-boards': [
      { name: 'Blue River Board', price: 180, image: '/images/gallery/river1.jpg' },
      { name: 'Green Wave Board', price: 165, image: '/images/gallery/river2.jpg' },
    ],
    'river-tables': [
      { name: 'Ocean River Table', price: 1200, image: '/images/gallery/IMG_1692.jpg' },
      { name: 'Lake River Table', price: 950, image: '/images/gallery/rivertable2.jpg' },
    ],
    'skulls': [
      { name: 'Xtra Large Epoxy Skull', price: 20, image: '/images/gallery/skull1.jpg' },
      { name: 'Large Epoxy Skull ', price: 110, image: '/images/gallery/skull2.jpg' },
      { name: 'Medium Epoxy Skull', price: 85, image: '/images/gallery/skull1.jpg' },
      { name: 'Small Epoxy Skull', price: 110, image: '/images/gallery/skull2.jpg' },
    ],
    'animals': [
      { name: 'Large Epoxy Cat', price: 95, image: '/images/gallery/animal1.jpg' },
      { name: 'Medium Epoxy Cat', price: 135, image: '/images/gallery/animal2.jpg' },
      { name: 'Small Epoxy Cat', price: 135, image: '/images/gallery/animal2.jpg' },
      { name: 'Large Epoxy Dog', price: 95, image: '/images/gallery/animal1.jpg' },
      { name: 'Medium Epoxy Dog', price: 135, image: '/images/gallery/animal2.jpg' },
      { name: 'Small Epoxy Dog', price: 135, image: '/images/gallery/animal2.jpg' },
    ],
    'Coasters': [
      { name: 'Round Wave Coaster', price: 40, image: '/images/gallery/other1.jpg' },
      { name: 'Hexagon Wave Coaster', price: 120, image: '/images/gallery/other2.jpg' },
      { name: 'Square Fence Coaster', price: 40, image: '/images/gallery/other1.jpg' },
      
    ],
    'Bathroom Set': [
      { name: 'Custom Coaster Set', price: 40, image: '/images/gallery/other1.jpg' },
      { name: 'Wine Rack', price: 120, image: '/images/gallery/other2.jpg' },
      { name: 'Wine Rack', price: 120, image: '/images/gallery/other2.jpg' },
    ],
    
  },
  'for-sale': {
    'lazy-susans': [
      { name: 'Acacia Lazy Susan 12"', price: 75, image: '/images/gallery/lazy4.jpg' },
      { name: 'Maple Lazy Susan 14"', price: 90, image: '/images/gallery/lazy5.jpg' },
    ],
    'cutting-boards': [
      { name: 'Walnut Cutting Board', price: 55, image: '/images/gallery/board4.jpg' },
      { name: 'Acacia Board with Handle', price: 70, image: '/images/gallery/board5.jpg' },
    ],
    'tables': [
      { name: 'Dining Table', price: 850, image: '/images/gallery/table3.jpg' },
    ],
    'trays': [
      { name: 'Decorative Tray', price: 48, image: '/images/gallery/tray3.jpg' },
    ],
    'river-boards': [
      { name: 'Turquoise River Board', price: 175, image: '/images/gallery/river3.jpg' },
    ],
    'river-tables': [
      { name: 'Sky River Table', price: 1100, image: '/images/gallery/rivertable3.jpg' },
    ],
    'skulls': [
      { name: 'Wooden Skull', price: 90, image: '/images/gallery/skull3.jpg' },
    ],
    'animals': [
      { name: 'Wolf Carving', price: 105, image: '/images/gallery/animal3.jpg' },
    ],
    'other': [
      { name: 'Jewelry Box', price: 65, image: '/images/gallery/other3.jpg' },
    ],
  },
};

const GALLERY_DATA = assignDynamicIds(RAW_GALLERY_DATA);

const CATEGORIES = [
  { id: 'lazy-susans', name: 'Lazy Susans', icon: '🌀' },
  { id: 'cutting-boards', name: 'Cutting Boards', icon: '🔪' },
  { id: 'tables', name: 'Tables', icon: '🪑' },
  { id: 'trays', name: 'Trays', icon: '🍽️' },
  { id: 'river-boards', name: 'River Boards', icon: '🌊' },
  { id: 'river-tables', name: 'River Tables', icon: '💧' },
  { id: 'skulls', name: 'Skulls', icon: '💀' },
  { id: 'animals', name: 'Animals', icon: '🦅' },
  { id: 'holidays', name: 'Holidays', icon: '✨' },
];

function GalleryShop({ addToCart }) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('available-order');
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(4); // Start with middle item
  const [showModal, setShowModal] = useState(false);
  const [addedItem, setAddedItem] = useState(null);

  const activeCategory = CATEGORIES[activeCategoryIndex];
  const items = GALLERY_DATA[activeSection][activeCategory.id] || [];

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

  // ENHANCED: Add to cart with image URL for Square
  const handleAddToCart = (item) => {
    const cartItem = {
      ...item,
      id: `gallery-${Date.now()}`, // Unique string ID for gallery items
      quantity: 1,
      type: activeSection === 'available-order' ? 'order' : 'sale',
      category: activeCategory.name,
      
      // IMPORTANT: Add imageUrl for Square catalog
      imageUrl: item.image, // This is what the server expects for images
      
      // Keep the original image property for display
      image: item.image,
      
      // Add description for Square
      description: `${activeCategory.name} - ${item.name}`,
      
      // Flag to indicate this is a gallery item (not custom)
      isCustom: false,
      
      // Ensure price fields are consistent
      totalPrice: item.price, // Use same price for consistency
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
      {/* Persistent Banner Indicator */}
      <div className={`banner-indicator ${activeSection === 'available-order' ? 'banner-order' : 'banner-sale'}`}>
        <span className="banner-icon">
          {activeSection === 'available-order' ? '📦' : '🛒'}
        </span>
        <span className="banner-text">
          You are browsing: {activeSection === 'available-order' ? 'Available by Order' : 'Available Items For Sale'}
        </span>
      </div>

      <div className="gallery-header">
        <h1>Our Gallery</h1>
        <p>Browse our collection of handcrafted woodwork</p> <br/> Click Available By Order <br/> Or <br/> 
        Available Items For Sale
      </div>

      {/* Section Toggle */}
      <div className="section-toggle">
        <button
          className={`section-btn ${activeSection === 'available-order' ? 'active' : ''}`}
          onClick={() => setActiveSection('available-order')}
        >
          Available by Order
        </button>
        <button
          className={`section-btn ${activeSection === 'for-sale' ? 'active' : ''}`}
          onClick={() => setActiveSection('for-sale')}
        >
          Available Items For Sale
        </button>
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
              <div key={item.id} className="item-card">
                <div className="item-image-container">
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23e8e8e8" width="300" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E' + item.name + '%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-price">${item.price}</p>
                  <button
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(item)}
                  >
                    {activeSection === 'available-order' ? 'Order And Pay Now' : 'Buy Now'}
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
            <div className="modal-icon">✔</div>
            <h2>Item Added to Shopping Cart</h2>
            {addedItem && (
              <p className="modal-item-name">{addedItem.name} - ${addedItem.price}</p>
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