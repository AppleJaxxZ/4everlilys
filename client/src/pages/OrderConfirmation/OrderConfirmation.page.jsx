import React from 'react';
import { useLocation } from 'react-router-dom';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const { state } = useLocation();
  const receipt = state?.receipt;
  const payment = receipt?.payment;
  const items = receipt?.items || [];

  if (!payment || items.length === 0) {
    return (
      <div className="order-container">
        <h2>Order Not Found</h2>
        <p>We couldn’t find your order details. Please check your email for confirmation.</p>
      </div>
    );
  }

  const formatDate = (iso) => new Date(iso).toLocaleString();
  const formatAmount = (cents) => `$${(Number(cents) / 100).toFixed(2)}`;
  const { id, status, amount, currency, createdAt, receiptUrl } = payment;

  return (
    <div className="order-container">
      <h1 className="order-title">🎉 Thank You for Your Order!</h1>
      <p>Your payment was successful. Below is your receipt:</p>

      <div className="receipt-box">
        <h2>Order Receipt</h2>
        <p><strong>Transaction ID:</strong> {id}</p>

        {items.map((item, index) => (
          <div key={item.id || index} className="item-summary">
            <p><strong>Item #{index + 1}:</strong> {item.name}</p>
            {item.gift && <p><strong>Gift:</strong> {item.gift.name}</p>}
            {item.size && <p><strong>Size:</strong> {item.size.name}</p>}
            {item.wood && <p><strong>Wood:</strong> {item.wood.name}</p>}
            <p><strong>Handle:</strong> {item.handle ? item.handle.name : 'No Handle'}</p>
            {item.handleType && <p><strong>Handle Type:</strong> {item.handleType.name}</p>}
            {item.designs?.length > 0 && (
              <p><strong>Designs:</strong> {item.designs.map(d => d.name).join(', ')}</p>
            )}
            <p><strong>Category:</strong> {item.category}</p>
            <p><strong>Type:</strong> {item.type === 'order' ? 'Available by Order' : 'Ready to Ship'}</p>
            <p><strong>Quantity:</strong> {item.quantity}</p>
            <p><strong>Price:</strong> ${item.totalPrice ? item.totalPrice.toFixed(2) : item.price.toFixed(2)}</p>
            <hr />
          </div>
        ))}

        <p><strong>Status:</strong> {status}</p>
        <p><strong>Amount:</strong> {formatAmount(amount)}</p>
        <p><strong>Currency:</strong> {currency}</p>
        <p><strong>Date:</strong> {formatDate(createdAt)}</p>
        {receiptUrl && (
          <p>
            <strong>Square Receipt:</strong>{' '}
            <a href={receiptUrl} target="_blank" rel="noopener noreferrer">
              View Online
            </a>
          </p>
        )}
      </div>

      <button className="print-button" onClick={() => window.print()}>
        🖨️ Print Receipt
      </button>
    </div>
  );
};

export default OrderConfirmation;
