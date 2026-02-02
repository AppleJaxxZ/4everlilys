import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import SquarePayment from '../../assests/SquarePayment';
import './Payment.css';

function Payment({ cart, user, clearCart, getCartTotal }) {
  const navigate = useNavigate();
  const [shippingInfo, setShippingInfo] = useState(null);
  const [billingInfo, setBillingInfo] = useState(null);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [feeBreakdown, setFeeBreakdown] = useState(null);

  // useEffect 1: Load from sessionStorage (runs first)
  useEffect(() => {
    const savedShipping = sessionStorage.getItem('shippingInfo');
    const savedBilling = sessionStorage.getItem('billingInfo');
    const savedSameAsShipping = sessionStorage.getItem('billingSameAsShipping');
    
    if (!savedShipping) {
      // Redirect to shipping if no info found
      navigate('/shipping');
      return;
    }
    
    // Load shipping info
    setShippingInfo(JSON.parse(savedShipping));
    console.log('✅ Loaded shipping from sessionStorage');
    
    // Load billing info
    if (savedBilling) {
      setBillingInfo(JSON.parse(savedBilling));
      console.log('✅ Loaded billing from sessionStorage');
    }
    
    // Load billing preference
    if (savedSameAsShipping) {
      setBillingSameAsShipping(savedSameAsShipping === 'true');
    }

    // Redirect if cart is empty
    if (!cart || cart.length === 0) {
      navigate('/checkout');
    }
  }, [cart, navigate]);

  // useEffect 2: Load from Firebase for logged-in users (optional fallback)
  useEffect(() => {
    const loadSavedInfo = async () => {
      if (user && !shippingInfo) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            
            // Load shipping info if not already loaded
            if (data.shipping && !shippingInfo) {
              setShippingInfo(data.shipping);
              console.log('✅ Loaded shipping from Firebase');
            }
            
            // Load billing info if not already loaded
            if (data.billing && !billingInfo) {
              setBillingInfo(data.billing);
              console.log('✅ Loaded billing from Firebase');
            }
            
            // Load billing preference
            if (data.billingSameAsShipping !== undefined) {
              setBillingSameAsShipping(data.billingSameAsShipping);
            }
          }
        } catch (error) {
          console.error('Error loading saved info from Firebase:', error);
        }
      }
    };

    loadSavedInfo();
  }, [user, shippingInfo, billingInfo]);

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
      billingInfo: billingInfo,
      orderId: result.orderId,
      breakdown: result.breakdown,
      rawResult: result,
    };

    // Clear cart
    clearCart();
    
    // Clear checkout info from session
    sessionStorage.removeItem('shippingInfo');
    sessionStorage.removeItem('billingInfo');
    sessionStorage.removeItem('billingSameAsShipping');
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
              
              {/* Show Billing Address if Different */}
              {!billingSameAsShipping && billingInfo && (
                <>
                  <h3 style={{ marginTop: '20px' }}>Billing Address:</h3>
                  <div className="address-info">
                    <p>{billingInfo.address}</p>
                    <p>{billingInfo.city}, {billingInfo.state} {billingInfo.zipCode}</p>
                    <p>{billingInfo.country}</p>
                  </div>
                </>
              )}
              
              <button 
                className="edit-shipping-btn"
                onClick={() => navigate('/shipping')}
              >
                Edit Shipping/Billing Info
              </button>
            </div>

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
                <h5><strong>SHIPPING COST: </strong> SHIPPING COST WILL BE BILLED SEPARATELY ONCE PACKAGE IS READY TO BE SHIPPED</h5>
                <p><strong>We use ShipPirate to ensure you are getting the absolute lowest prices compared to our competitors.</strong></p>
                  <p><strong>Custom Items:</strong> 2-4 weeks for crafting</p>
                  <p><strong>Ready-Made:</strong> Ships in 3-9 business days</p>
                  <p><strong>Delivery:</strong> 5-7 business days via standard shipping</p>
                  <p className="info-note">📍 Tracking information provided with all orders as soon as your package is shipped.</p>
                </div>
              </div>

              <div className="badge-info-card refund-badge">
                <div className="badge-card-header">
                  <div className="badge-icon-circle refund-icon">✓</div>
                  <div className="badge-title-group">
                    <h3>Quality Guarantee</h3>
                    <p className="badge-subtitle">No Refunds</p>
                  </div>
                </div>
                <div className="badge-card-content">
                  <p><strong>No Refunds Unless Approved By 4EverLilys:</strong> .</p>
                  <p className="info-note">⚠️ Most Items are Non-Refundable.</p>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="payment-form-container">
              <h3>Payment Method</h3>
              
              {paymentError && (
                <div className="payment-error">
                  ❌ {paymentError} Please Check your card details and try again.
                </div>
              )}
              
              <div className="square-payment-wrapper">
                <SquarePayment
                  amount={Math.round(calculateTotal() * 100)}
                  items={cart}
                  shippingInfo={shippingInfo}
                  billingInfo={billingInfo}
                  billingSameAsShipping={billingSameAsShipping}
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
              <p className="powered-by">Powered by Square • Secured with AVS & 3D Secure</p>
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
                  <div className="summary-row">
                    <span>Shipping Fee</span>
                    <span>Shipping Billed Separately!</span>
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
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Tax (6%)</span>
                    <span>${(calculateTotal() * 0.06).toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Processing Fee</span>
                    <span>~${((calculateTotal() * 1.06) * 0.029 + 0.30).toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping Fee</span>
                    <span>Shipping Billed Separately!</span>
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