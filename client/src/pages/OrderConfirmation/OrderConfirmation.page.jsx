import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const receipt = state?.receipt;
  const payment = receipt?.payment;
  const items = receipt?.items || [];
  const shippingInfo = receipt?.shippingInfo;

  if (!payment || items.length === 0) {
    return (
      <div className="order-container">
        <h2>Order Not Found</h2>
        <p>We couldn't find your order details. Please check your email for confirmation.</p>
        <button 
          className="browse-btn" 
          onClick={() => navigate('/gallery-shop')}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const formatDate = (iso) => new Date(iso).toLocaleString();
  const formatAmount = (cents) => `$${(Number(cents) / 100).toFixed(2)}`;
  const { id, status, amount, currency, createdAt, receiptUrl } = payment;

  return (
    <div className="order-container">
      <h1 className="order-title">🎉 Thank You for Your Order!</h1>
      <p>Your payment was successful. A confirmation email has been sent to your business email.</p>

      <div className="receipt-box">
        <h2>Order Receipt</h2>
        
        {/* Order ID and Status */}
        <div className="receipt-section">
          <p><strong>Order ID:</strong> {receipt.orderId || id}</p>
          <p><strong>Transaction ID:</strong> {id}</p>
          <p><strong>Status:</strong> <span className="status-paid">{status}</span></p>
          <p><strong>Date:</strong> {formatDate(createdAt)}</p>
        </div>

        {/* Shipping Information */}
        {shippingInfo && (
          <div className="receipt-section">
            <h3>Shipping Information</h3>
            <div className="shipping-details">
              <p><strong>Ship To:</strong></p>
              <p>{shippingInfo.firstName} {shippingInfo.lastName}</p>
              <p>{shippingInfo.address}</p>
              {shippingInfo.apartment && <p>{shippingInfo.apartment}</p>}
              <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
              <p>{shippingInfo.country}</p>
              <br />
              <p><strong>Contact:</strong></p>
              <p>Email: {shippingInfo.email}</p>
              <p>Phone: {shippingInfo.phone}</p>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="receipt-section">
          <h3>Order Items</h3>
          {items.map((item, index) => (
            <div key={item.id || index} className="item-summary">
              <p className="item-number"><strong>Item #{index + 1}:</strong> {item.name}</p>
              <div className="item-config">
                {item.gift && <p>• Type: {item.gift.name}</p>}
                {item.size && <p>• Size: {item.size.name}</p>}
                {item.wood && <p>• Wood: {item.wood.name}</p>}
                {item.handle && <p>• Handle: {item.handle.name}</p>}
                {item.handleType && <p>• Handle Type: {item.handleType.name}</p>}
                {item.designs?.length > 0 && (
                  <p>• Design: {item.designs.map(d => d.name).join(', ')}</p>
                )}
                {item.category && <p>• Category: {item.category}</p>}
                {item.type && <p>• Type: {item.type === 'order' ? 'Available by Order' : 'Ready to Ship'}</p>}
              </div>
              <div className="item-pricing">
                <p>Quantity: {item.quantity}</p>
                <p>Price: ${item.totalPrice ? item.totalPrice.toFixed(2) : item.price.toFixed(2)}</p>
                <p className="item-total">
                  Subtotal: ${((item.totalPrice || item.price) * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Summary */}
        <div className="receipt-section payment-summary">
          <h3>Payment Summary</h3>
          {receipt.breakdown ? (
            <>
              <div className="summary-line">
                <span>Subtotal:</span>
                <span>${receipt.breakdown.subtotal}</span>
              </div>
              <div className="summary-line">
                <span>Tax:</span>
                <span>${receipt.breakdown.tax}</span>
              </div>
              <div className="summary-line">
                <span>Processing Fee:</span>
                <span>${receipt.breakdown.squareFee}</span>
              </div>
              <div className="summary-line total">
                <span><strong>Total Paid:</strong></span>
                <span><strong>${receipt.breakdown.total}</strong></span>
              </div>
            </>
          ) : (
            <div className="summary-line total">
              <span><strong>Total Paid:</strong></span>
              <span><strong>{formatAmount(amount)}</strong></span>
            </div>
          )}
          <p className="currency">Currency: {currency}</p>
        </div>

        {/* Square Receipt Link */}
        {receiptUrl && (
          <div className="receipt-section">
            <p>
              <strong>Square Receipt:</strong>{' '}
              <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="receipt-link">
                View Online Receipt
              </a>
            </p>
          </div>
        )}

        {/* Next Steps */}
        <div className="receipt-section next-steps">
          <h3>What's Next?</h3>
          <ul>
            <li>✓ Order confirmation email sent to your business email</li>
            <li>✓ Customer will receive confirmation at {shippingInfo?.email}</li>
            <li>✓ Order saved to your dashboard</li>
            <li>✓ We'll begin crafting your custom items</li>
            <li>✓ Once the order is complete and ready to ship we will email you a link for a one time payment to cover the shipping cost.</li>
          </ul>
        </div>
      </div>

      <div className="action-buttons">
        <button className="print-button" onClick={() => window.print()}>
          🖨️ Print Receipt
        </button>
        <button 
          className="continue-shopping-btn" 
          onClick={() => navigate('/gallery-shop')}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;