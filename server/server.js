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

    // ✅ ADD THIS HELPER at the top of the function
    function encodeAddress(text) {
      // Convert to HTML entities to prevent linking
      return text.split('').map(char => {
        if (char === ' ') return '&nbsp;';
        if (char === ',') return ',';
        return `&#${char.charCodeAt(0)};`;
      }).join('');
    }

    // ... format date, items, etc. ...

    const emailContent = `
      <html>
      <head>
        <meta name="format-detection" content="address=no">
        <meta name="format-detection" content="telephone=no">
        <style>
          body { font-family: Arial, sans-serif; line-height:1.6; color:#333; }
          .container { max-width:600px; margin:0 auto; padding:20px; background:#ffffff; }
          .header { background:#2c3e50; color:white; padding:20px; border-radius:5px 5px 0 0; text-align:center; }
          .content { background:white; padding:20px; border:1px solid #ddd; }
          .info-section { margin:20px 0; padding:15px; background:#f9f9f9; border-left:4px solid #2c3e50; }
          .info-label { font-weight:bold; color:#2c3e50; display:inline-block; width:120px; }
          
          /* NUCLEAR OPTION: Force all links to look like text */
          .address-box a,
          .address-box a:link,
          .address-box a:visited,
          .address-box a:hover,
          .address-box a:active {
            color: #333 !important;
            text-decoration: none !important;
            cursor: text !important;
            pointer-events: none !important;
          }
          
          .address-box {
            font-family: 'Courier New', Courier, monospace;
            background: #ffffff;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            color: #333;
            line-height: 1.8;
            font-size: 14px;
          }
          
          /* Apple Mail override */
          a[x-apple-data-detectors] {
            color: #333 !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
          }
          
          ul { list-style:none; padding:0; margin:15px 0; }
          .total-box { background:#2c3e50; color:white; padding:15px; border-radius:5px; margin:15px 0; }
          .footer { background:#f5f5f5; padding:15px; text-align:center; border-radius:0 0 5px 5px; font-size:0.9em; color:#666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0;">🎉 New Order Received!</h1>
            <p style="margin:5px 0;">Payment Confirmed - Ready for Processing</p>
          </div>
          
          <div class="content">
            <div class="info-section">
              <h2 style="margin-top:0;">📋 Order Information</h2>
              <p>
                <span class="info-label">Date:</span> ${formattedDate}<br>
                <span class="info-label">Payment ID:</span> ${paymentId}<br>
                <span class="info-label">Status:</span> ✅ ${payment.status}<br>
                <span class="info-label">Receipt:</span> <a href="${payment.receiptUrl}" target="_blank">View Receipt</a>
              </p>
            </div>
            
            <div class="info-section">
              <h2 style="margin-top:0;">👤 Customer</h2>
              <p>
                <span class="info-label">Name:</span> ${shippingInfo.firstName} ${shippingInfo.lastName}<br>
                <span class="info-label">Email:</span> <span style="font-family:monospace;">${safeEmail}</span><br>
                <span class="info-label">Phone:</span> ${safePhone}
              </p>
            </div>
            
            <!-- SHIPPING ADDRESS - NUCLEAR FIX -->
            <div class="info-section">
  <h2 style="margin-top:0;">📦 Shipping Address</h2>
  <table style="border:none; width:100%; font-family:monospace; font-size:14px; line-height:1.8;">
    <tr><td style="padding:2px 0; color:#333;">Street:</td><td style="padding:2px 0 2px 10px; color:#333;">${shippingInfo.address}</td></tr>
    ${shippingInfo.apartment ? `<tr><td style="padding:2px 0; color:#333;">Apt:</td><td style="padding:2px 0 2px 10px; color:#333;">${shippingInfo.apartment}</td></tr>` : ''}
    <tr><td style="padding:2px 0; color:#333;">City:</td><td style="padding:2px 0 2px 10px; color:#333;">${shippingInfo.city}</td></tr>
    <tr><td style="padding:2px 0; color:#333;">State:</td><td style="padding:2px 0 2px 10px; color:#333;">${shippingInfo.state}</td></tr>
    <tr><td style="padding:2px 0; color:#333;">ZIP:</td><td style="padding:2px 0 2px 10px; color:#333;">${shippingInfo.zipCode}</td></tr>
    <tr><td style="padding:2px 0; color:#333;">Country:</td><td style="padding:2px 0 2px 10px; color:#333;">${shippingInfo.country}</td></tr>
  </table>
</div>

            <h2>🛒 Items Ordered (${items.length})</h2>
            <ul>${itemsList}</ul>

            <div class="total-box">
              <p style="margin:5px 0;">
                <span style="display:inline-block;width:120px;">Subtotal:</span> 
                <span style="float:right;">$${subtotal.toFixed(2)}</span>
              </p>
              <p style="margin:5px 0;">
                <span style="display:inline-block;width:120px;">Tax (6%):</span> 
                <span style="float:right;">$${tax.toFixed(2)}</span>
              </p>
              <hr style="border:none;border-top:1px solid rgba(255,255,255,0.3);margin:10px 0;">
              <p style="margin:5px 0;font-size:1.2em;font-weight:bold;">
                <span style="display:inline-block;width:120px;">TOTAL PAID:</span> 
                <span style="float:right;">$${total}</span>
              </p>
            </div>
            
            <div class="info-section" style="border-left-color:#e74c3c;">
              <h3 style="margin-top:0;color:#e74c3c;">⚠️ RETURN POLICY</h3>
              <p style="margin:0;">All sales are final. There are no refunds on any items from 4Everlilys unless your order is canceled within 24 hours of purchase.</p>
            </div>
          </div>

          <div class="footer">
            <p style="margin:5px 0;">Order received: ${formattedDate}</p>
            <p style="margin:5px 0;font-weight:bold;">4EverLilys Wood Crafts</p>
            <p style="margin:5px 0;font-size:0.85em;">This is an automated notification email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const subject = `New Order - ${shippingInfo.firstName} ${shippingInfo.lastName} - $${total}`;

    // --- 5. Send email ---
    console.log('📧 Sending email via Resend...');
    
    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.BUSINESS_EMAIL || 'smackanalex@gmail.com',
      subject,
      html: emailContent,
    });
    
    // ✅ FIX: Resend returns { data: {...}, error: {...} }
    console.log('📧 Resend full response:', JSON.stringify(response, null, 2));
    
    if (response.error) {
      console.error('❌ Resend error:', response.error);
      throw new Error(response.error.message || 'Email send failed');
    }
    
    const messageId = response.data?.id || 'email-sent';
    console.log('✅ Order notification email sent:', messageId);
    
    return { 
      success: true, 
      messageId: messageId,
      fullResponse: response.data
    };
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