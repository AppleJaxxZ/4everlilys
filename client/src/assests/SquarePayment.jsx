import React from 'react';
import { CreditCard, PaymentForm } from 'react-square-web-payments-sdk';

function SquarePayment({ amount, items, onPaymentSuccess, onPaymentError }) {
  // Function to prepare items with images for payment
  const prepareItemsForPayment = (items) => {
    return items.map(item => {
      // Create a clean item object for payment
      const paymentItem = {
        id: item.id,
        name: item.name,
        quantity: item.quantity || 1,
        price: item.price,
        totalPrice: item.totalPrice,
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

  return (
    <PaymentForm
      applicationId={process.env.REACT_APP_SQUARE_APP_ID}
      locationId={process.env.REACT_APP_SQUARE_LOCATION_ID}
      cardTokenizeResponseReceived={async (token, verifiedBuyer) => {
        try {
          // Prepare items with images
          const preparedItems = prepareItemsForPayment(items);
          
          // Call YOUR backend (not Square directly)
          const response = await fetch('http://localhost:3001/api/process-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sourceId: token.token,
              items: preparedItems,
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
        }
      }}
      createVerificationDetails={() => ({
        amount: (amount / 100).toString(),
        currencyCode: 'USD',
        intent: 'CHARGE',
        billingContact: {
          addressLines: [''],
          familyName: '',
          givenName: '',
          city: '',
          state: '',
          postalCode: '',
          countryCode: 'US',
        },
      })}
    >
      <CreditCard />
    </PaymentForm>
  );
}

export default SquarePayment;