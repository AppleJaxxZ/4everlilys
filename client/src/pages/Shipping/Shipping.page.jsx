import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import './Shipping.css';

function Shipping({ cart, user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errors, setErrors] = useState({});
  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    saveInfo: false
  });


  // ADD: Separate billing address state
const [billingInfo, setBillingInfo] = useState({
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'US',
});

// ADD: Toggle for "same as shipping"
const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);

// ADD: Handler for billing info
const handleBillingChange = (e) => {
  const { name, value } = e.target;
  setBillingInfo(prev => ({ ...prev, [name]: value }));
};

  useEffect(() => {
    // Redirect if cart is empty
    if (!cart || cart.length === 0) {
      navigate('/checkout');
      return;
    }

    // Load saved shipping info if user is logged in
    const loadSavedInfo = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const savedData = docSnap.data();
            setShippingData(prev => ({
              ...prev,
              firstName: savedData.firstName || '',
              lastName: savedData.lastName || '',
              email: user.email || savedData.email || '',
              phone: savedData.phone || '',
              address: savedData.address || '',
              apartment: savedData.apartment || '',
              city: savedData.city || '',
              state: savedData.state || '',
              zipCode: savedData.zipCode || '',
              country: savedData.country || 'United States',
              saveInfo: true
            }));
          } else {
            // Use email from auth if available
            setShippingData(prev => ({
              ...prev,
              email: user.email || ''
            }));
          }
        } catch (error) {
          console.error('Error loading saved info:', error);
        }
      }
      setLoadingProfile(false);
    };

    loadSavedInfo();
  }, [cart, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setShippingData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!shippingData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!shippingData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!shippingData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(shippingData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!shippingData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!shippingData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!shippingData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!shippingData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!shippingData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveShippingAndBillingInfo = async () => {
    try {
      // Prepare billing data - use shipping if same, otherwise use separate billing
      const finalBillingInfo = billingSameAsShipping 
        ? {
            address: shippingData.address,
            city: shippingData.city,
            state: shippingData.state,
            zipCode: shippingData.zipCode,
            country: 'US'
          }
        : billingInfo;
  
      const checkoutData = {
        shipping: shippingData,
        billing: finalBillingInfo,
        billingSameAsShipping: billingSameAsShipping,
        updatedAt: new Date().toISOString()
      };
  
      // Save to appropriate collection based on user status
      if (user) {
        // Save to user's profile
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, checkoutData, { merge: true });
        console.log('✅ Saved to user profile:', user.uid);
      } else {
        // Save to temporary collection for guest users
        const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const guestRef = doc(db, 'guestCheckouts', guestId);
        await setDoc(guestRef, {
          ...checkoutData,
          createdAt: new Date().toISOString(),
          cart: cart
        });
        
        // Store guest ID in sessionStorage for payment page
        sessionStorage.setItem('guestCheckoutId', guestId);
        console.log('✅ Saved guest checkout:', guestId);
      }
      
      // Store shipping and billing info in sessionStorage for immediate use
      sessionStorage.setItem('shippingInfo', JSON.stringify(shippingData));
      sessionStorage.setItem('billingInfo', JSON.stringify(finalBillingInfo));
      sessionStorage.setItem('billingSameAsShipping', billingSameAsShipping.toString());
      
      return true;
    } catch (error) {
      console.error('❌ Error saving checkout info:', error);
      return false;
    }
  };
  const handleContinueToPayment = async (e) => {
    e.preventDefault();
    
    // Validate shipping form
    if (!shippingData.firstName || !shippingData.lastName || !shippingData.email || 
        !shippingData.phone || !shippingData.address || !shippingData.city || 
        !shippingData.state || !shippingData.zipCode) {
      alert('Please fill in all required shipping fields');
      return;
    }
  
    // Validate billing form if not same as shipping
    if (!billingSameAsShipping) {
      if (!billingInfo.address || !billingInfo.city || !billingInfo.state || !billingInfo.zipCode) {
        alert('Please fill in all required billing fields');
        return;
      }
    }
  
    // Save both shipping and billing info
    const saved = await saveShippingAndBillingInfo();
    
    if (saved) {
      // Navigate to payment page
      navigate('/payment');
    } else {
      alert('Failed to save checkout information. Please try again.');
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.totalPrice || item.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };

  if (loadingProfile) {
    return (
      <div className="shipping-page">
        <div className="loading-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shipping-page">
      <div className="shipping-container">
        <div className="shipping-content">
          <div className="shipping-form-section">
            <h1>Shipping Information</h1>
            
            {errors.general && (
              <div className="error-message general-error">
                {errors.general}
              </div>
            )}
            
            <form onSubmit={handleContinueToPayment}>
              <div className="form-section">
                <h3>Contact Information</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name *</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={shippingData.firstName}
                      onChange={handleInputChange}
                      className={errors.firstName ? 'error' : ''}
                    />
                    {errors.firstName && (
                      <span className="field-error">{errors.firstName}</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name *</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={shippingData.lastName}
                      onChange={handleInputChange}
                      className={errors.lastName ? 'error' : ''}
                    />
                    {errors.lastName && (
                      <span className="field-error">{errors.lastName}</span>
                    )}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={shippingData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <span className="field-error">{errors.email}</span>
                  )}
                  <small>We'll send your order confirmation here</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={shippingData.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? 'error' : ''}
                    placeholder="(555) 123-4567"
                  />
                  {errors.phone && (
                    <span className="field-error">{errors.phone}</span>
                  )}
                  <small>In case we need to contact you about your order</small>
                </div>
              </div>
              
              <div className="form-section">
                <h3>Shipping Address</h3>
                
                <div className="form-group">
                  <label htmlFor="address">Street Address *</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={shippingData.address}
                    onChange={handleInputChange}
                    className={errors.address ? 'error' : ''}
                    placeholder="123 Main Street"
                  />
                  {errors.address && (
                    <span className="field-error">{errors.address}</span>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="apartment">Apartment, Suite, etc. (Optional)</label>
                  <input
                    type="text"
                    id="apartment"
                    name="apartment"
                    value={shippingData.apartment}
                    onChange={handleInputChange}
                    placeholder="Apt 4B"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={shippingData.city}
                      onChange={handleInputChange}
                      className={errors.city ? 'error' : ''}
                    />
                    {errors.city && (
                      <span className="field-error">{errors.city}</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="state">State *</label>
                    <select
                      id="state"
                      name="state"
                      value={shippingData.state}
                      onChange={handleInputChange}
                      className={errors.state ? 'error' : ''}
                    >
                      <option value="">Select State</option>
                      <option value="PA">Pennsylvania</option>
                      <option value="AL">Alabama</option>
                      <option value="AK">Alaska</option>
                      <option value="AZ">Arizona</option>
                      <option value="AR">Arkansas</option>
                      <option value="CA">California</option>
                      <option value="CO">Colorado</option>
                      <option value="CT">Connecticut</option>
                      <option value="DE">Delaware</option>
                      <option value="FL">Florida</option>
                      <option value="GA">Georgia</option>
                      <option value="HI">Hawaii</option>
                      <option value="ID">Idaho</option>
                      <option value="IL">Illinois</option>
                      <option value="IN">Indiana</option>
                      <option value="IA">Iowa</option>
                      <option value="KS">Kansas</option>
                      <option value="KY">Kentucky</option>
                      <option value="LA">Louisiana</option>
                      <option value="ME">Maine</option>
                      <option value="MD">Maryland</option>
                      <option value="MA">Massachusetts</option>
                      <option value="MI">Michigan</option>
                      <option value="MN">Minnesota</option>
                      <option value="MS">Mississippi</option>
                      <option value="MO">Missouri</option>
                      <option value="MT">Montana</option>
                      <option value="NE">Nebraska</option>
                      <option value="NV">Nevada</option>
                      <option value="NH">New Hampshire</option>
                      <option value="NJ">New Jersey</option>
                      <option value="NM">New Mexico</option>
                      <option value="NY">New York</option>
                      <option value="NC">North Carolina</option>
                      <option value="ND">North Dakota</option>
                      <option value="OH">Ohio</option>
                      <option value="OK">Oklahoma</option>
                      <option value="OR">Oregon</option>
                      <option value="RI">Rhode Island</option>
                      <option value="SC">South Carolina</option>
                      <option value="SD">South Dakota</option>
                      <option value="TN">Tennessee</option>
                      <option value="TX">Texas</option>
                      <option value="UT">Utah</option>
                      <option value="VT">Vermont</option>
                      <option value="VA">Virginia</option>
                      <option value="WA">Washington</option>
                      <option value="WV">West Virginia</option>
                      <option value="WI">Wisconsin</option>
                      <option value="WY">Wyoming</option>
                    </select>
                    {errors.state && (
                      <span className="field-error">{errors.state}</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="zipCode">ZIP Code *</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={shippingData.zipCode}
                      onChange={handleInputChange}
                      className={errors.zipCode ? 'error' : ''}
                      placeholder="12345"
                    />
                    {errors.zipCode && (
                      <span className="field-error">{errors.zipCode}</span>
                    )}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <select
                    id="country"
                    name="country"
                    value={shippingData.country}
                    onChange={handleInputChange}
                  >
                    <option value="United States">United States</option>
                  </select>
                </div>
              </div>

              {/* Billing Address Section */}
<div className="billing-section">
  <h2>Billing Address</h2>
  
  <label className="checkbox-label">
    <input
      type="checkbox"
      checked={billingSameAsShipping}
      onChange={(e) => setBillingSameAsShipping(e.target.checked)}
    />
    Same as shipping address
  </label>

  {!billingSameAsShipping && (
    <div className="billing-form">
      <div className="form-group">
        <label>Street Address *</label>
        <input
          type="text"
          name="address"
          value={billingInfo.address}
          onChange={handleBillingChange}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>City *</label>
          <input
            type="text"
            name="city"
            value={billingInfo.city}
            onChange={handleBillingChange}
            required
          />
        </div>

        <div className="form-group">
          <label>State *</label>
          <input
            type="text"
            name="state"
            value={billingInfo.state}
            onChange={handleBillingChange}
            placeholder="PA"
            maxLength="2"
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>ZIP Code *</label>
          <input
            type="text"
            name="zipCode"
            value={billingInfo.zipCode}
            onChange={handleBillingChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Country *</label>
          <select
            name="country"
            value={billingInfo.country}
            onChange={handleBillingChange}
            required
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
          </select>
        </div>
      </div>
    </div>
  )}
</div>
              
              {user && (
                <div className="save-info-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="saveInfo"
                      checked={shippingData.saveInfo}
                      onChange={handleInputChange}
                    />
                    Save this information for next time
                  </label>
                </div>
              )}
              
              <div className="form-actions">
                <button
                  type="button"
                  className="back-btn"
                  onClick={() => navigate('/checkout')}
                >
                  ← Back to Cart
                </button>
                
                <button
                  type="submit"
                  className="continue-btn"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Continue to Payment →'}
                </button>
              </div>
            </form>
          </div>
          
          <div className="order-summary-section">
            <div className="order-summary">
              <h2>Order Summary</h2>
              
              <div className="order-items">
                {cart.map((item) => (
                  <div key={item.id} className="summary-item">
                    <div className="item-info">
                      <img 
                        src={item.image || item.gift?.image || '/images/placeholder.jpg'} 
                        alt={item.name}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect fill="%23e8e8e8" width="60" height="60"/%3E%3C/svg%3E';
                        }}
                      />
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p className="item-qty">Qty: {item.quantity || 1}</p>
                      </div>
                    </div>
                    <div className="item-price">
                      ${((item.totalPrice || item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
              
              <div className="summary-row">
                <span>Shipping</span>
                <span>Calculated at payment</span>
              </div>
              
              <div className="summary-row">
                <span>Tax</span>
                <span>Calculated at payment</span>
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="summary-row total">
                <span>Estimated Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Shipping;