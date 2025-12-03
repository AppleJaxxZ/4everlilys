// Enhanced server with Square payments + email notifications
const express = require('express');
const cors = require('cors');
const { Client, Environment } = require('square');
const crypto = require('crypto');
const multer = require('multer');
require('dotenv').config();
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

// Configure file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

app.use(cors({
  origin: ['https://4everlilys.netlify.app', 'http://localhost:3000'],
}));
app.use(express.json({ limit: '10mb' }));

// Initialize Square
const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENV === 'production'
    ? Environment.Production
    : Environment.Sandbox,
});


console.log('✅ Square client initialized');
console.log('✅ Email service initialized');
console.log('🚀 Server is loading environment...');
console.log(process.env.NODE_ENV);

//
// Helper: Send order notification email
//
async function sendOrderNotificationEmail({ paymentId, amount, items, shippingInfo, orderDate }) {
  // Add this helper function at the top of sendOrderNotificationEmail
function preventLinking(text) {
  // Convert each character to HTML entity
  return text.split('').map(char => {
    if (char === ' ') return '&nbsp;';
    return `&#${char.charCodeAt(0)};`;
  }).join('');
}
  try {
    // Check environment variables
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is not set!');
      return { success: false, error: 'Email service not configured - missing API key' };
    }

    // --- 1. Fetch full payment details from Square ---
    const { result } = await client.paymentsApi.getPayment(paymentId);
    const payment = result.payment;

    if (!payment) throw new Error('Payment not found in Square');

    console.log('📧 Sending order email with:', shippingInfo);

    // --- 2. Format order items ---
    const itemsList = items.map(item => {
      let details = `
        <li style="margin-bottom:15px;padding:10px;background:#f5f5f5;border-radius:5px;">
          <strong>${item.name}</strong><br>
          Quantity: ${item.quantity}<br>
          Price: $${(item.totalPrice || item.price).toFixed(2)} each<br>
          Subtotal: $${((item.totalPrice || item.price) * item.quantity).toFixed(2)}<br>`;
      
      // Custom Builder items
      if (item.gift || item.size || item.wood) {
        details += `<br><strong>Custom Configuration:</strong><br>`;
        if (item.gift?.name) details += `Type: ${item.gift.name}<br>`;
        if (item.size?.name) details += `Size: ${item.size.name}<br>`;
        if (item.wood?.name) details += `Wood: ${item.wood.name}<br>`;
        if (item.handle?.name) details += `Handle: ${item.handle.name}<br>`;
        if (item.handleType?.name) details += `Handle Type: ${item.handleType.name}<br>`;
        if (item.designs?.[0]?.name) details += `Design: ${item.designs[0].name}<br>`;
      } 
      // Gallery Shop items
      else {
        if (item.category) details += `<br><strong>Category:</strong> ${item.category}<br>`;
        if (item.type) details += `<strong>Type:</strong> ${item.type === 'order' ? 'Made to Order' : 'Ready to Ship'}<br>`;
        if (item.description) details += `<strong>Description:</strong> ${item.description}<br>`;
      }
      
      details += `</li>`;
      return details;
    }).join('');

    // --- 3. Totals ---
    const subtotal = items.reduce((sum, i) => sum + ((i.totalPrice || i.price) * i.quantity), 0);
    const tax = subtotal * 0.06;
    const total = (amount / 100).toFixed(2);

    const formattedDate = new Date(orderDate).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // --- 4. Email HTML ---
    const emailContent = `
      <html>
      <head>
        <style>
          body { font-family: Arial; line-height:1.6; color:#333; }
          .container { max-width:600px; margin:0 auto; padding:20px; }
          .header { background:#2c3e50; color:white; padding:20px; border-radius:5px 5px 0 0; }
          .content { background:white; padding:20px; border:1px solid #ddd; }
          ul { list-style:none; padding:0; }
          .footer { background:#f5f5f5; padding:15px; text-align:center; border-radius:0 0 5px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 New Order Received!</h1>
            <p>Payment Confirmed - Ready for Processing</p>
          </div>
          <div class="content">
            <h2>Order Information</h2>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Payment ID:</strong> ${paymentId}</p>
            <p><strong>Status:</strong> ✅ ${payment.status}</p>
            <p><strong>Receipt:</strong> <a href="${payment.receiptUrl}" target="_blank">View Receipt</a></p>
            
            <h2>Customer</h2>
            <p>${shippingInfo.firstName} ${shippingInfo.lastName}<br>
               ${shippingInfo.email}<br>${shippingInfo.phone}</p>
            
            <div class="info-section">
  <h2 style="margin-top:0;">📦 Shipping Address</h2>
  <div style="font-family:monospace; background:#fff; padding:10px; border:1px solid #ddd; border-radius:4px;">
    ${preventLinking(shippingInfo.address)}<br>
    ${shippingInfo.apartment ? preventLinking(shippingInfo.apartment) + '<br>' : ''}
    ${preventLinking(shippingInfo.city + ', ' + shippingInfo.state + ' ' + shippingInfo.zipCode)}<br>
    ${preventLinking(shippingInfo.country)}
  </div>
</div>

            <h2>Items (${items.length})</h2>
            <ul>${itemsList}</ul>

            <h3>Totals</h3>
            <p>Subtotal: $${subtotal.toFixed(2)}</p>
            <p>Tax (6%): $${tax.toFixed(2)}</p>
            <p><strong>Total Paid: $${total}</strong></p>
            
            <h3>RETURN POLICY</h3>
            <p>All sales are final. There are no refunds on any items from 4Everlilys unless your order is canceled within 24 hours.</p>
          </div>

          <div class="footer">
            <p>Order received on ${formattedDate}</p>
            <p>4EverLilys Wood Crafts</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const subject = `New Order - ${shippingInfo.firstName} ${shippingInfo.lastName} - $${total}`;

    // --- 5. Send email ---
    console.log('📧 Sending email via Resend...');
    
    const info = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.BUSINESS_EMAIL || 'smackanalex@gmail.com',
      subject,
      html: emailContent,
    });

    // ✅ FIX: Log the full response to see structure
    console.log('📧 Resend response:', JSON.stringify(info, null, 2));

    // ✅ FIX: Handle different response structures
    const messageId = info?.id || info?.data?.id || info?.messageId || 'email-sent-no-id';
    
    console.log('✅ Order notification email sent:', messageId);
    return { 
      success: true, 
      messageId: messageId,
      fullResponse: info 
    };

  } catch (error) {
    console.error('❌ Error sending email:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      statusCode: error.statusCode
    });
    return { success: false, error: error.message };
  }
}
//
// Helper: createCatalogItemWithImage (unchanged)
//
async function createCatalogItemWithImage(item) {
  try {
    const catalogItem = {
      type: 'ITEM',
      id: `#${item.name.replace(/\s+/g, '_')}_${Date.now()}`,
      itemData: {
        name: item.name,
        description: [
          item.gift?.name && `Type: ${item.gift.name}`,
          item.size?.name && `Size: ${item.size.name}`,
          item.wood?.name && `Wood: ${item.wood.name}`,
          item.handle?.name && `Handle: ${item.handle.name}`,
          item.handleType?.name && `Handle Type: ${item.handleType.name}`,
          item.designs?.length && `Designs: ${item.designs.map(d => d.name).join(', ')}`,
          item.category && `Category: ${item.category}`,
        ].filter(Boolean).join(' | '),
        variations: [{
          type: 'ITEM_VARIATION',
          id: `#${item.name.replace(/\s+/g, '_')}_var_${Date.now()}`,
          itemVariationData: {
            name: 'Standard',
            pricingType: 'FIXED_PRICING',
            priceMoney: {
              amount: Number(Math.round((item.totalPrice || item.price || 0) * 100)),
              currency: 'USD',
            },
          },
        }],
      },
    };

    const catalogResponse = await client.catalogApi.upsertCatalogObject({
      idempotencyKey: crypto.randomUUID(),
      object: catalogItem,
    });

    return catalogResponse.result.catalogObject;
  } catch (error) {
    console.error('Error creating catalog item:', error);
    return null;
  }
}

//
// Main payment route
//
app.post('/api/process-payment', async (req, res) => {
  const { sourceId, verificationToken, items, shippingInfo, billingInfo } = req.body;

  console.log('📥 BACKEND - Received payment request');
  console.log('🏠 Billing Address:', billingInfo);
  
  if (!sourceId || !items || !billingInfo) {
    return res.status(400).json({ success: false, message: 'Missing payment data.' });
  }

  try {
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + ((item.totalPrice || item.price) * item.quantity), 0);
    const tax = subtotal * 0.06;
    const total = subtotal + tax;
    const amountInCents = Number(Math.round(total * 100));

    // Format line items
    const lineItems = items.map(item => {
      let noteDetails = '';
      
      if (item.gift || item.size || item.wood) {
        const customDetails = [
          item.gift?.name && `Type: ${item.gift.name}`,
          item.size?.name && `Size: ${item.size.name}`,
          item.wood?.name && `Wood: ${item.wood.name}`,
          item.handle?.name && `Handle: ${item.handle.name}`,
          item.handleType?.name && `Handle Type: ${item.handleType.name}`,
          item.designs?.length && `Design: ${item.designs.map(d => d.name).join(', ')}`,
        ].filter(Boolean);
        noteDetails = customDetails.join(' | ');
      } else {
        const galleryDetails = [
          item.category && `Category: ${item.category}`,
          item.type && `Type: ${item.type === 'order' ? 'Made to Order' : 'Ready to Ship'}`,
          item.description && `${item.description}`,
        ].filter(Boolean);
        noteDetails = galleryDetails.join(' | ');
      }

      return {
        name: item.name,
        quantity: String(item.quantity || 1),
        basePriceMoney: {
          amount: Math.round((item.totalPrice || item.price) * 100),
          currency: 'USD'
        },
        note: noteDetails || undefined,
      };
    });

    // Create ORDER
    const orderResponse = await client.ordersApi.createOrder({
      order: {
        locationId: process.env.SQUARE_LOCATION_ID,
        lineItems: lineItems,
        taxes: [{
          name: 'Sales Tax',
          percentage: '6.0',
          scope: 'ORDER'
        }]
      },
      idempotencyKey: crypto.randomUUID()
    });

    const order = orderResponse.result.order;
    console.log('✅ Order created:', order.id);

    // ✅ CREATE PAYMENT with billing address for AVS
    const paymentResponse = await client.paymentsApi.createPayment({
      sourceId,
      idempotencyKey: crypto.randomUUID(),
      locationId: process.env.SQUARE_LOCATION_ID,
      amountMoney: { 
        amount: Number(order.totalMoney.amount),
        currency: 'USD' 
      },
      orderId: order.id,
      
      // ✅ ADD: Verification token for 3D Secure
      verificationToken: verificationToken,
      
      // ✅ ADD: Billing address for AVS check
      billingAddress: {
        addressLine1: billingInfo.address,
        locality: billingInfo.city,
        administrativeDistrictLevel1: billingInfo.state,
        postalCode: billingInfo.zipCode,
        country: billingInfo.country || 'US'
      },
      
      // Buyer email for verification
      buyerEmailAddress: shippingInfo.email,
    });

    const payment = paymentResponse.result.payment;
    
    // CHECK AVS RESULTS
    const cardDetails = payment.cardDetails;
    console.log('🔒 AVS Check:', cardDetails?.avsStatus);
    console.log('🔒 CVV Check:', cardDetails?.cvvStatus);
    
    // Optional: Reject if AVS fails
    if (cardDetails?.avsStatus === 'AVS_REJECTED') {
      console.warn('⚠️ AVS verification failed');
      // You can choose to reject or flag for manual review
      // return res.status(400).json({ 
      //   success: false, 
      //   message: 'Billing address verification failed' 
      // });
    }

    console.log('✅ Payment created:', payment.id);

    // Send order email
    const emailResult = await sendOrderNotificationEmail({
      paymentId: payment.id,
      amount: Number(order.totalMoney.amount),
      items,
      shippingInfo,
      orderDate: new Date().toISOString()
    });

    res.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: Number(payment.amountMoney.amount),
        currency: payment.amountMoney.currency,
        createdAt: payment.createdAt,
        orderId: payment.orderId,
        receiptUrl: payment.receiptUrl,
        avsStatus: cardDetails?.avsStatus, // Return AVS result
        cvvStatus: cardDetails?.cvvStatus, // Return CVV result
      },
      email: emailResult,
    });
    
  } catch (error) {
    console.error('❌ Payment failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

//
// Test email endpoint
//
app.post('/api/test-email', async (req, res) => {
  try {
    const info = await resend.emails.send({
      from: `onboarding@resend.dev`,
      to: process.env.BUSINESS_EMAIL || process.env.EMAIL_USER,
      subject: 'Test Email from 4EverLilys Server',
      text: 'This is a plain text test email.',
    });
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('❌ Test email failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  const now = new Date();
console.log(`✅ Server running on http://localhost:${PORT} @ ${now.toLocaleString("en-US")}`);
});