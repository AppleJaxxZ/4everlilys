import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';

function Checkout({ cart = [], user, updateQuantity, removeFromCart }) {
  const navigate = useNavigate();

  const validCart = cart.filter(item => item && item.id && item.name);
  console.log('🛒 CHECKOUT - Cart items:', validCart);
console.log('🛒 CHECKOUT - First item:', validCart[0]);
console.log('🛒 Has gift?', !!validCart[0]?.gift);
console.log('🛒 Has size?', !!validCart[0]?.size);
console.log('🛒 Has wood?', !!validCart[0]?.wood);

  const calculateTotal = () => {
    return validCart.reduce((total, item) => {
      const price = item.totalPrice || item.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };

  const calculateSubtotal = (item) => {
    const price = item.totalPrice || item.price || 0;
    const quantity = item.quantity || 1;
    return price * quantity;
  };

  const handleProceedToShipping = () => {
    navigate('/shipping');
  };

  if (!validCart || validCart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your Cart is Empty</h2>
          <p>Add some items to get started!</p>
          <button className="browse-btn" onClick={() => navigate('/gallery-shop')}>
            Browse Gallery
          </button>
          <button className="build-btn" onClick={() => navigate('/build-custom')}>
            Build Custom Item
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>Shopping Cart</h1>
        
        <div className="cart-content">
          {/* Cart Items */}
          <div className="cart-items">
            {validCart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <img 
                    src={item.image || item.gift?.image || '/images/placeholder.jpg'} 
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%23e8e8e8" width="150" height="150"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
                
                <div className="item-details">
                  <h3>{item.name}</h3>
                  
                  {item.gift && (
                    <div className="custom-details">
                      <p><strong>Type:</strong> {item.gift.name}</p>
                      {item.size && <p><strong>Size:</strong> {item.size.name}</p>}
                      {item.wood && <p><strong>Wood:</strong> {item.wood.name}</p>}
                      {item.handle && <p><strong>Handle:</strong> {item.handle.name}</p>}
                      {item.handleType && <p><strong>Handle Type:</strong> {item.handleType.name}</p>}
                      {item.designs && item.designs.length > 0 && (
                        <p><strong>Design:</strong> {item.designs[0].name}</p>
                      )}
                    </div>
                  )}

                  {item.category && <p className="item-category">{item.category}</p>}
                  {item.type && (
                    <p className="item-type">
                      {item.type === 'order' ? '📦 Available by Order' : '✅ Ready to Ship'}
                    </p>
                  )}
                </div>

                <div className="item-price">
                  <p className="price">${(item.totalPrice || item.price || 0).toFixed(2)}</p>
                </div>

                <div className="item-quantity">
                  <button 
                    className="qty-btn"
                    onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                  >
                    -
                  </button>
                  <span className="qty-display">{item.quantity || 1}</span>
                  <button 
                    className="qty-btn"
                    onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                  >
                    +
                  </button>
                </div>

                <div className="item-subtotal">
                  <p>${calculateSubtotal(item).toFixed(2)}</p>
                </div>

                <button 
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  🗑️
                </button>
              </div>

              
            ))}

            {/* Shipping & Policy Info Cards - Option 6 Style */}
            <div className="policy-info-section">
              <div className="badge-info-card shipping-badge">
                <div className="badge-card-header">
                  <div className="badge-icon-circle">🚚</div>
                  <div className="badge-title-group">
                    <h3>Shipping Timeline</h3>
                    <p className="badge-subtitle">When to expect your order</p>
                  </div>
                </div>
                <div className="badge-card-content">
                  <p><strong>Custom Items:</strong> 2-4 weeks for crafting</p>
                  <p><strong>Ready-Made:</strong> Ships in 3-5 business days</p>
                  <p><strong>Delivery:</strong> 5-7 business days via standard shipping</p>
                  <p className="info-note">📍 Tracking information provided with all orders</p>
                </div>
              </div>

              <div className="badge-info-card refund-badge">
                <div className="badge-card-header">
                  <div className="badge-icon-circle refund-icon">✓</div>
                  <div className="badge-title-group">
                    <h3>Quality Guarantee</h3>
                    <p className="badge-subtitle">24 hour refund policy</p>
                  </div>
                </div>
                <div className="badge-card-content">
                  <p><strong>24 hour refund policy:</strong> All sales are final.  You have 24 hours to cancel your order from the date and time of payment. </p>
                  <p className="info-note">⚠️ ALL items are non-refundable unless the order is canceled within 24 hours.  To Cancel your order please email us @ <a href="4everlilyswc@gmail.com">Email Me</a></p>
                </div>
              </div>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="cart-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-row">
              <span>Subtotal ({validCart.length} {validCart.length === 1 ? 'item' : 'items'})</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>

            <div className="summary-row">
              <span>Tax</span>
              <span>Calculated at checkout</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total">
              <span>Subtotal</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>

            <button 
              className="checkout-btn"
              onClick={handleProceedToShipping}
            >
              Proceed to Checkout
            </button>

            <button className="continue-shopping-btn" onClick={() => navigate('/gallery-shop')}>
              Continue Shopping
            </button>

            {user ? (
              <p className="user-info">Logged in as {user.email}</p>
            ) : (
              <p className="login-prompt">
                <a href="/login">Log in</a> for faster checkout
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;