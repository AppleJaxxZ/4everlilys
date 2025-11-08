import React, {useState} from 'react';
import { CreditCard, PaymentForm } from 'react-square-web-payments-sdk';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner.component';

function SquarePayment({ amount, items, shippingInfo, onPaymentSuccess, onPaymentError }) {
  const [loading, setLoading] = useState(false);
  
  // Function to prepare items with images for payment
  const prepareItemsForPayment = (items) => {
    return items.map(item => {
      // Create a clean item object for payment
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

      // Add custom configuration if present
      if (item.gift) paymentItem.gift = item.gift;
      if (item.size) paymentItem.size = item.size;
      if (item.wood) paymentItem.wood = item.wood;
      if (item.handle) paymentItem.handle = item.handle;
      if (item.handleType) paymentItem.handleType = item.handleType;
      if (item.designs) paymentItem.designs = item.designs;

      // Include image data if present (limit size for transmission)
      if (item.imageData) {
        // If image is too large, you might want to compress it
        const maxImageSize = 500000; // 500KB limit
        if (item.imageData.length < maxImageSize) {
          paymentItem.imageData = item.imageData;
        } else {
          // Optionally compress or just use URL
          console.warn('Image too large, using URL instead');
          paymentItem.imageUrl = item.imageUrl || item.image;
        }
      } else if (item.imageUrl || item.image) {
        paymentItem.imageUrl = item.imageUrl || item.image;
      }

      return paymentItem;
    });
  };

  // Check if we have shipping info
  React.useEffect(() => {
    if (!shippingInfo) {
      console.warn('No shipping info provided to SquarePayment component');
      // Try to get from sessionStorage as backup
      const savedShipping = sessionStorage.getItem('shippingInfo');
      if (savedShipping) {
        console.log('Found shipping info in sessionStorage');
      }
    }
  }, [shippingInfo]);

  return (
    <PaymentForm
      applicationId={process.env.REACT_APP_SQUARE_APP_ID}
      locationId={process.env.REACT_APP_SQUARE_LOCATION_ID}
      cardTokenizeResponseReceived={async (token, verifiedBuyer) => {
        setLoading(true);
        try {
          // Prepare items with images
          const preparedItems = prepareItemsForPayment(items);
          const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
          console.log("BackendUrl", backendUrl);

          // Get shipping info from props or sessionStorage
          let finalShippingInfo = shippingInfo;
          if (!finalShippingInfo) {
            const savedShipping = sessionStorage.getItem('shippingInfo');
            if (savedShipping) {
              finalShippingInfo = JSON.parse(savedShipping);
            }
          }

          // Call YOUR backend (not Square directly) with shipping info
          const response = await fetch(`${backendUrl}/api/process-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sourceId: token.token,
              items: preparedItems,
              shippingInfo: finalShippingInfo || {}, // Pass empty object if no shipping info
              verifiedBuyer: verifiedBuyer,
            }),
          });

          const result = await response.json();
          
          if (result.success) {
            onPaymentSuccess(result);
          } else {
            onPaymentError(result.error || result.message);
          }
        } catch (error) {
          console.error('Payment error:', error);
          onPaymentError(error.message);
        } finally {
          setLoading(false);
        }
      }}
      createVerificationDetails={() => {
        let billingInfo = shippingInfo;
        if (!billingInfo) {
          const savedShipping = sessionStorage.getItem('shippingInfo');
          if (savedShipping) {
            billingInfo = JSON.parse(savedShipping);
          }
        }
      
        if (!billingInfo || !billingInfo.firstName || !billingInfo.address) {
          console.warn('⚠️ Missing billing info — verification may fail.');
        }
      
        const verificationDetails = {
          amount: Number(amount / 100).toString(),
          currencyCode: 'USD',
          intent: 'CHARGE',
          billingContact: {
            addressLines: [billingInfo?.address || ''],
            familyName: billingInfo?.lastName || '',
            givenName: billingInfo?.firstName || '',
            email: billingInfo?.email || '',
            phone: billingInfo?.phone || '',
            city: billingInfo?.city || '',
            state: billingInfo?.state || '',
            postalCode: billingInfo?.zipCode || '',
            countryCode: 'US',
          },
        };
      
        console.log('🔍 Verification Details:', verificationDetails);
        return verificationDetails;
      }}
      
    >
      <CreditCard />
      {loading && <LoadingSpinner />}
    </PaymentForm>
  );
}

export default SquarePayment;