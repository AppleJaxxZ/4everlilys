import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';

function Checkout({ cart, user, updateQuantity, removeFromCart }) {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.displayName || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax
  };

  const calculateShipping = () => {
    return cart.length > 0 ? 10 : 0; // Flat $10 shipping
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSquarePayment = async () => {
    // Validate shipping info
    if (!shippingInfo.fullName || !shippingInfo.email || !shippingInfo.address) {
      alert('Please fill in all required shipping information');
      return;
    }

    setIsProcessing(true);

    // TODO: Integrate Square Payment Processing
    // This is where you'll add your Square Web Payments SDK integration
    // Documentation: https://developer.squareup.com/docs/web-payments/overview
    
    /* SQUARE INTEGRATION TEMPLATE:
    
    1. Include Square Web Payments SDK in index.html:
       <script type="text/javascript" 
               src="https://sandbox.web.squarecdn.com/v1/square.js">
       </script>
    
    2. Initialize payments:
       const payments = Square.payments(applicationId, locationId);
       const card = await payments.card();
       await card.attach('#card-container');
    
    3. Process payment:
       const result = await card.tokenize();
       if (result.status === 'OK') {
         // Send result.token to your backend
         // Backend creates payment with Square API
       }
    */

    // Simulated payment processing
    setTimeout(() => {
      alert('Payment processed successfully! (This is a simulation - integrate Square for real payments)');
      setIsProcessing(false);
      // Clear cart and redirect
      navigate('/');
    }, 2000);
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add some beautiful woodcrafted gifts to your cart!</p>
          <button 
            className="continue-shopping-btn"
            onClick={() => navigate('/build-custom')}
          >
            Build Custom Gift
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1 className="checkout-title">Checkout</h1>
      
      <div className="checkout-layout">
        <div className="checkout-left">
          {/* Cart Items */}
          <div className="cart-section">
            <h2>Order Summary</h2>
            {cart.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="cart-item-details">
                  <h3>{item.gift.name}</h3>
                  <p>Size: {item.size.name}</p>
                  <p>Colors: {item.colors.map(c => c.name).join(', ')}</p>
                  
                  <div className="cart-item-quantity">
                    <button 
                      onClick={() => updateQuantity(index, item.quantity - 1)}
                      className="quantity-btn-small"
                    >
                      -
                    </button>
                    <span className="quantity-text">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(index, item.quantity + 1)}
                      className="quantity-btn-small"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="cart-item-price">
                  <p className="item-price">${item.totalPrice}</p>
                  <button 
                    onClick={() => removeFromCart(index)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Shipping Information */}
          <div className="shipping-section">
            <h2>Shipping Information</h2>
            {!user && (
              <p className="login-prompt">
                <button onClick={() => navigate('/login')} className="login-link">
                  Login
                </button> 
                {' '}for faster checkout with saved information
              </p>
            )}
            
            <form className="shipping-form">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={shippingInfo.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={shippingInfo.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingInfo.phone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    value={shippingInfo.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>ZIP Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={shippingInfo.zipCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Payment Section */}
          <div className="payment-section">
            <h2>Payment Information</h2>
            <div id="card-container" className="card-container">
              {/* Square Payment Form will be inserted here */}
              <p className="payment-note">
                💳 Square payment integration placeholder. 
                Add your Square credentials and initialize the payment form here.
              </p>
            </div>
          </div>
        </div>

        {/* Order Total */}
        <div className="checkout-right">
          <div className="order-total-card">
            <h2>Order Total</h2>
            
            <div className="total-row">
              <span>Subtotal:</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
            
            <div className="total-row">
              <span>Tax (8%):</span>
              <span>${calculateTax().toFixed(2)}</span>
            </div>
            
            <div className="total-row">
              <span>Shipping:</span>
              <span>${calculateShipping().toFixed(2)}</span>
            </div>
            
            <div className="total-row total-final">
              <span><strong>Total:</strong></span>
              <span><strong>${calculateTotal().toFixed(2)}</strong></span>
            </div>

            <button 
              className="checkout-btn"
              onClick={handleSquarePayment}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Complete Purchase'}
            </button>

            <button 
              className="continue-shopping-link"
              onClick={() => navigate('/build-custom')}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;