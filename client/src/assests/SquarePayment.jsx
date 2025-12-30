import React, { useState, useCallback } from 'react';
import { CreditCard, PaymentForm } from 'react-square-web-payments-sdk';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner.component';

function SquarePayment({ 
  amount, 
  items, 
  shippingInfo, 
  billingInfo,
  billingSameAsShipping,
  onPaymentSuccess, 
  onPaymentError 
}) {
  const [loading, setLoading] = useState(false);

  // ✅ ADD THIS - Debug environment variables
  React.useEffect(() => {
    console.log('🔍 Square Configuration:');
    console.log('  App ID:', process.env.REACT_APP_SQUARE_APP_ID?.substring(0, 25) + '...');
    console.log('  Location ID:', process.env.REACT_APP_SQUARE_LOCATION_ID);
    console.log('  Backend URL:', process.env.REACT_APP_BACKEND_URL);
    
    if (!process.env.REACT_APP_SQUARE_APP_ID) {
      console.error('❌ MISSING: REACT_APP_SQUARE_APP_ID');
    }
    if (!process.env.REACT_APP_SQUARE_LOCATION_ID) {
      console.error('❌ MISSING: REACT_APP_SQUARE_LOCATION_ID');
    }
  }, []);
  
  // Function to prepare items with images for payment
  const prepareItemsForPayment = (items) => {
    return items.map(item => {
      const paymentItem = {
        id: item.id,
        name: item.name,
        quantity: item.quantity || 1,
        price: Number(item.price),
        totalPrice: Number(item.totalPrice),
        category: item.category,
        type: item.type,
        isCustom: item.isCustom || false,
      };

      if (item.gift) paymentItem.gift = item.gift;
      if (item.size) paymentItem.size = item.size;
      if (item.wood) paymentItem.wood = item.wood;
      if (item.handle) paymentItem.handle = item.handle;
      if (item.handleType) paymentItem.handleType = item.handleType;
      if (item.designs) paymentItem.designs = item.designs;

      if (item.imageData) {
        const maxImageSize = 500000;
        if (item.imageData.length < maxImageSize) {
          paymentItem.imageData = item.imageData;
        } else {
          console.warn('Image too large, using URL instead');
          paymentItem.imageUrl = item.imageUrl || item.image;
          paymentItem.imagePath = item.imagePath || item.image || item.imageUrl;
        }
      } else if (item.imageUrl || item.image) {
        paymentItem.imageUrl = item.imageUrl || item.image;
        paymentItem.imagePath = item.imagePath || item.image || item.imageUrl;
      }

      return paymentItem;
    });
  };
  console.log('🖼️ Prepared items for payment:', preparedItems.map(item => ({
    name: item.name,
    imagePath: item.imagePath,
    imageUrl: item.imageUrl,
    hasImage: !!(item.imagePath || item.imageUrl)
  })));

  // ✅ FIX: Use useCallback to memoize the function
  const getFinalBillingInfo = useCallback(() => {
    if (billingSameAsShipping || !billingInfo) {
      return {
        address: shippingInfo?.address || '',
        city: shippingInfo?.city || '',
        state: shippingInfo?.state || '',
        zipCode: shippingInfo?.zipCode || '',
        country: 'US'
      };
    } else {
      return billingInfo;
    }
  }, [billingSameAsShipping, billingInfo, shippingInfo]);

  // Check if we have required info
  React.useEffect(() => {
    if (!shippingInfo) {
      console.warn('⚠️ No shipping info provided to SquarePayment component');
      const savedShipping = sessionStorage.getItem('shippingInfo');
      if (savedShipping) {
        console.log('✅ Found shipping info in sessionStorage');
      }
    }
    
    const finalBilling = getFinalBillingInfo();
    if (!finalBilling.address || !finalBilling.zipCode) {
      console.warn('⚠️ Incomplete billing address - AVS verification may fail');
    } else {
      console.log('✅ Billing address ready for AVS verification');
    }
  }, [shippingInfo, billingInfo, billingSameAsShipping, getFinalBillingInfo]); // ✅ Now it's safe to include

  return (
    <PaymentForm
      applicationId={process.env.REACT_APP_SQUARE_APP_ID}
      locationId={process.env.REACT_APP_SQUARE_LOCATION_ID}
      cardTokenizeResponseReceived={async (token, verifiedBuyer) => {
        setLoading(true);
        try {
          const preparedItems = prepareItemsForPayment(items);
          const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
          console.log("🌐 Backend URL:", backendUrl);

          let finalShippingInfo = shippingInfo;
          if (!finalShippingInfo) {
            const savedShipping = sessionStorage.getItem('shippingInfo');
            if (savedShipping) {
              finalShippingInfo = JSON.parse(savedShipping);
            }
          }

          const finalBillingInfo = getFinalBillingInfo();

          console.log('💳 Processing payment with:');
          console.log('  - Verification token:', verifiedBuyer?.token ? 'Present ✅' : 'Missing ❌');
          console.log('  - Billing address:', finalBillingInfo);
          console.log('  - Items:', preparedItems.length);

          const response = await fetch(`${backendUrl}/api/process-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sourceId: token.token,
              verificationToken: verifiedBuyer?.token,
              items: preparedItems,
              shippingInfo: finalShippingInfo || {},
              billingInfo: finalBillingInfo,
            }),
          });

          const result = await response.json();
          
          if (result.success) {
            console.log('✅ Payment successful');
            console.log('🔒 AVS Status:', result.payment?.avsStatus);
            console.log('🔒 CVV Status:', result.payment?.cvvStatus);
            onPaymentSuccess(result);
          } else {
            console.error('❌ Payment failed:', result.error || result.message);
            onPaymentError(result.error || result.message);
          }
        } catch (error) {
          console.error('❌ Payment error:', error);
          onPaymentError(error.message);
        } finally {
          setLoading(false);
        }
      }}
      createVerificationDetails={() => {
        let finalShippingInfo = shippingInfo;
        if (!finalShippingInfo) {
          const savedShipping = sessionStorage.getItem('shippingInfo');
          if (savedShipping) {
            finalShippingInfo = JSON.parse(savedShipping);
          }
        }

        const finalBillingInfo = getFinalBillingInfo();
      
        if (!finalShippingInfo?.firstName || !finalBillingInfo?.address) {
          console.warn('⚠️ Missing required info for buyer verification');
        }
      
        const verificationDetails = {
          amount: Number(amount / 100).toFixed(2),
          currencyCode: 'USD',
          intent: 'CHARGE',
          billingContact: {
            addressLines: [finalBillingInfo?.address || ''],
            familyName: finalShippingInfo?.lastName || '',
            givenName: finalShippingInfo?.firstName || '',
            email: finalShippingInfo?.email || '',
            phone: finalShippingInfo?.phone || '',
            city: finalBillingInfo?.city || '',
            state: finalBillingInfo?.state || '',
            postalCode: finalBillingInfo?.zipCode || '',
            countryCode: finalBillingInfo?.country || 'US',
          },
        };
      
        console.log('🔐 Creating buyer verification with billing address:', {
          address: finalBillingInfo?.address,
          city: finalBillingInfo?.city,
          state: finalBillingInfo?.state,
          zip: finalBillingInfo?.zipCode,
        });
        
        return verificationDetails;
      }}
    >
      <CreditCard />
      {loading && <LoadingSpinner />}
    </PaymentForm>
  );
}

export default SquarePayment;