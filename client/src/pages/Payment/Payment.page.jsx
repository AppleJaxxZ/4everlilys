import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SquarePayment from '../../assests/SquarePayment';
import './Payment.css';

function Payment({ cart, user, removeFromCart }) {
  const navigate = useNavigate();
  const [shippingInfo, setShippingInfo] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  // const [loading, setLoading] = useState(false);
  const [feeBreakdown, setFeeBreakdown] = useState(null);

  useEffect(() => {
    // Load shipping info from sessionStorage
    const savedShipping = sessionStorage.getItem('shippingInfo');
    if (!savedShipping) {
      // Redirect to shipping if no info found
      navigate('/shipping');
      return;
    }
    setShippingInfo(JSON.parse(savedShipping));

    // Redirect if cart is empty
    if (!cart || cart.length === 0) {
      navigate('/checkout');
    }
  }, [cart, navigate]);

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.totalPrice || item.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };

  const handlePaymentSuccess = async (result) => {
    console.log('Payment successful:', result);
    setPaymentSuccess(true);
    setPaymentError(null);
    setFeeBreakdown(result.breakdown);

    // Create receipt object with shipping info
    const receipt = {
      payment: result.payment,
      items: cart,
      shippingInfo: shippingInfo,
      orderId: result.orderId,
      breakdown: result.breakdown,
      rawResult: result,
    };

    // Clear cart
    cart.forEach(item => removeFromCart(item.id));
    
    // Clear shipping info from session
    sessionStorage.removeItem('shippingInfo');
    sessionStorage.removeItem('guestCheckoutId');

    // Redirect to confirmation
    setTimeout(() => {
      navigate('/order-confirmation', { state: { receipt } });
    }, 2000);
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setPaymentError(error);
    setPaymentSuccess(false);
  };

  if (!shippingInfo) {
    return (
      <div className="payment-page">
        <div className="loading-container">
          <p>Loading shipping information...</p>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="payment-page">
        <div className="payment-success">
          <div className="success-icon">✓</div>
          <h2>Payment Successful!</h2>
          <p>Thank you for your purchase. Redirecting to confirmation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-content">
          <div className="payment-section">
            <h1>Payment Information</h1>
            
            {/* Shipping Summary */}
            <div className="shipping-summary">
              <h3>Shipping To:</h3>
              <div className="address-info">
                <p>{shippingInfo.firstName} {shippingInfo.lastName}</p>
                <p>{shippingInfo.address}</p>
                {shippingInfo.apartment && <p>{shippingInfo.apartment}</p>}
                <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                <p>{shippingInfo.country}</p>
              </div>
              <button 
                className="edit-shipping-btn"
                onClick={() => navigate('/shipping')}
              >
                Edit Shipping Info
              </button>
            </div>

            {/* Payment Form */}
            <div className="payment-form-container">
              <h3>Payment Method</h3>
              
              {paymentError && (
                <div className="payment-error">
                  ❌ {paymentError}
                </div>
              )}
              
              <div className="square-payment-wrapper">
                <SquarePayment
                  amount={Math.round(calculateTotal() * 100)}
                  items={cart}
                  shippingInfo={shippingInfo} // Pass shipping info to payment
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                />
              </div>
              
              <div className="payment-actions">
                <button 
                  className="back-to-shipping-btn"
                  onClick={() => navigate('/shipping')}
                >
                  ← Back to Shipping
                </button>
              </div>
            </div>

            {/* Security Badge */}
            <div className="security-info">
              <div className="security-badge">
                <span className="lock-icon">🔒</span>
                <p>Your payment information is secure and encrypted</p>
              </div>
              <p className="powered-by">Powered by Square</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary-section">
            <div className="order-summary">
              <h2>Order Summary</h2>
              
              <div className="order-items">
                {cart.map((item) => (
                  <div key={item.id} className="summary-item">
                    <div className="item-info">
                      <div className="item-name">{item.name}</div>
                      <div className="item-details">
                        {item.gift && <span>Type: {item.gift.name}</span>}
                        {item.size && <span> • Size: {item.size.name}</span>}
                        {item.quantity > 1 && <span> • Qty: {item.quantity}</span>}
                      </div>
                    </div>
                    <div className="item-price">
                      ${((item.totalPrice || item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="summary-divider"></div>
              
              {feeBreakdown ? (
                <>
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>${feeBreakdown.subtotal}</span>
                  </div>
                  <div className="summary-row">
                    <span>Tax (PA 6%)</span>
                    <span>${feeBreakdown.tax}</span>
                  </div>
                  <div className="summary-row">
                    <span>Processing Fee</span>
                    <span>${feeBreakdown.squareFee}</span>
                  </div>
                  <div className="summary-divider"></div>
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>${feeBreakdown.total}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Tax (6%)</span>
                    <span>${(calculateTotal() * 0.06).toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Processing Fee</span>
                    <span>~${((calculateTotal() * 1.06) * 0.029 + 0.30).toFixed(2)}</span>
                  </div>
                  <div className="summary-divider"></div>
                  <div className="summary-row total">
                    <span>Estimated Total</span>
                    <span>${((calculateTotal() * 1.06) + ((calculateTotal() * 1.06) * 0.029 + 0.30)).toFixed(2)}</span>
                  </div>
                </>
              )}

              <div className="contact-info">
                <h4>Contact Information</h4>
                <p>{shippingInfo.email}</p>
                <p>{shippingInfo.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;