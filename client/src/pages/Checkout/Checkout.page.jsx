import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SquarePayment from '../../assests/SquarePayment';
import './Checkout.css';

function Checkout({ cart = [], user, updateQuantity, removeFromCart }) {
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false); // NEW
  const [paymentSuccess, setPaymentSuccess] = useState(false); // NEW
  const [paymentError, setPaymentError] = useState(null); // NEW

  const validCart = cart.filter(item => item && item.id && item.name);

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

  // NEW: Handle payment success
  const handlePaymentSuccess = (result) => {
    console.log('Payment successful:', result);
    setPaymentSuccess(true);
    setPaymentError(null);
  
    const receipt = {
      payment: result.payment,
      items: validCart,
      rawResult: result,
    };
  
    // ✅ Clear the cart
    cart.forEach(item => removeFromCart(item.id));
  
    setTimeout(() => {
      navigate('/order-confirmation', { state: { receipt } });
    }, 2000);
  };
  
  

  // NEW: Handle payment error
  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setPaymentError(error);
    setPaymentSuccess(false);
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

  // NEW: Show payment success message
  if (paymentSuccess) {
    return (
      <div className="checkout-page">
        <div className="payment-success">
          <div className="success-icon">✓</div>
          <h2>Payment Successful!</h2>
          <p>Thank you for your purchase. Redirecting...</p>
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
              <span>Total</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>

            {/* NEW: Show Square Payment Form or Checkout Button */}
            {!showPayment ? (
              <>
                <button 
                  className="checkout-btn"
                  onClick={() => setShowPayment(true)}
                >
                  Proceed to Payment
                </button>

                <button className="continue-shopping-btn" onClick={() => navigate('/gallery-shop')}>
                  Continue Shopping
                </button>
              </>
            ) : (
              <div className="payment-container">
                {paymentError && (
                  <div className="payment-error">
                    ❌ {paymentError}
                  </div>
                )}
                
                <SquarePayment
                  amount={Math.round(calculateTotal() * 100)} // Convert to cents
                  items = {validCart}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                />

                <button 
                  className="back-to-cart-btn"
                  onClick={() => setShowPayment(false)}
                >
                  ← Back to Cart
                </button>
              </div>
            )}

            {user ? (
              <p className="user-info">Logged in as {user.email}</p>
            ) : (
              <p className="login-prompt">
                <a href="/login">Log in</a> to save your cart
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;