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
  // Helper to prevent email clients from auto-linking addresses
  function preventLinking(text) {
    return text.split('').map(char => {
      if (char === ' ') return '&nbsp;';
      return `&#${char.charCodeAt(0)};`;
    }).join('');
  }

  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is not set!');
      return { success: false, error: 'Email service not configured' };
    }

    // Fetch payment details
    const { result } = await client.paymentsApi.getPayment(paymentId);
    const payment = result.payment;
    if (!payment) throw new Error('Payment not found in Square');

    console.log('📧 Preparing order email...');

    // --- Build items list with EMBEDDED images ---
    const itemsList = items.map(item => {
      let details = `
        <li style="margin-bottom:20px;padding:15px;background:#f9f9f9;border-radius:8px;border-left:4px solid #8b7355;">`;

      // ✅ EMBED IMAGE if it exists (using full Netlify URL)
      if (item.imagePath && item.imagePath !== '/images/placeholder.jpg') {
        const imageUrl = `https://4everlilys.netlify.app${item.imagePath}`;
        details += `
          <img 
            src="${imageUrl}" 
            alt="${item.name}" 
            style="
              max-width:300px;
              height:auto;
              border-radius:8px;
              margin-bottom:15px;
              display:block;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            " 
          />`;
      }

      details += `
          <div style="font-size:1.1em;margin-bottom:8px;">
            <strong style="color:#2c3e50;">${item.name}</strong>
          </div>
          <div style="color:#555;line-height:1.6;">
            <strong>Quantity:</strong> ${item.quantity}<br>
            <strong>Price:</strong> $${(item.totalPrice || item.price).toFixed(2)} each<br>
            <strong>Subtotal:</strong> $${((item.totalPrice || item.price) * item.quantity).toFixed(2)}
          </div>`;
      
      // Custom Builder items
      if (item.gift || item.size || item.wood) {
        details += `<div style="margin-top:12px;padding:10px;background:#fff;border-radius:5px;">
          <strong style="color:#8b7355;">Custom Configuration:</strong><br>`;
        if (item.gift?.name) details += `<span style="color:#666;">Type:</span> ${item.gift.name}<br>`;
        if (item.size?.name) details += `<span style="color:#666;">Size:</span> ${item.size.name}<br>`;
        if (item.wood?.name) details += `<span style="color:#666;">Wood:</span> ${item.wood.name}<br>`;
        if (item.handle?.name) details += `<span style="color:#666;">Handle:</span> ${item.handle.name}<br>`;
        if (item.handleType?.name) details += `<span style="color:#666;">Handle Type:</span> ${item.handleType.name}<br>`;
        if (item.designs?.[0]?.name) details += `<span style="color:#666;">Design:</span> ${item.designs[0].name}<br>`;
        details += `</div>`;
      } 
      // Gallery Shop items
      else {
        if (item.category || item.type || item.description) {
          details += `<div style="margin-top:12px;padding:10px;background:#fff;border-radius:5px;">`;
          if (item.category) details += `<strong style="color:#666;">Category:</strong> ${item.category}<br>`;
          if (item.type) details += `<strong style="color:#666;">Type:</strong> ${item.type === 'order' ? 'Made to Order' : 'Ready to Ship'}<br>`;
          if (item.description) details += `<strong style="color:#666;">Description:</strong> ${item.description}<br>`;
          details += `</div>`;
        }
      }
      
      details += `</li>`;
      return details;
    }).join('');

    // Calculate totals
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

    // --- Email HTML with embedded images ---
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container { 
            max-width: 650px;
            margin: 20px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #8b7355 0%, #6d5a44 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
          }
          .content { 
            padding: 30px;
          }
          .info-section {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #8b7355;
          }
          .info-section h2 {
            margin-top: 0;
            color: #8b7355;
            font-size: 18px;
          }
          ul { 
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .totals-box {
            background: #f0f0f0;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
          }
          .totals-box p {
            margin: 8px 0;
            display: flex;
            justify-content: space-between;
          }
          .totals-box .total-line {
            font-size: 1.3em;
            font-weight: bold;
            color: #8b7355;
            border-top: 2px solid #8b7355;
            padding-top: 12px;
            margin-top: 12px;
          }
          .footer { 
            background: #2c3e50;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 0.9em;
          }
          .footer p {
            margin: 5px 0;
          }
          .return-policy {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .return-policy h3 {
            margin-top: 0;
            color: #856404;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 New Order Received!</h1>
            <p>Payment Confirmed - Ready for Processing</p>
          </div>
          
          <div class="content">
            <div class="info-section">
              <h2>📋 Order Information</h2>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Payment ID:</strong> ${paymentId}</p>
              <p><strong>Status:</strong> ✅ ${payment.status}</p>
            </div>
            
            <div class="info-section">
              <h2>👤 Customer Information</h2>
              <p><strong>${shippingInfo.firstName} ${shippingInfo.lastName}</strong></p>
              <p>📧 ${shippingInfo.email}</p>
              <p>📱 ${shippingInfo.phone}</p>
            </div>
            
            <div class="info-section">
              <h2>📦 Shipping Address</h2>
              <div style="font-family:monospace; background:#fff; padding:12px; border:1px solid #ddd; border-radius:4px;">
                ${preventLinking(shippingInfo.address)}<br>
                ${shippingInfo.apartment ? preventLinking(shippingInfo.apartment) + '<br>' : ''}
                ${preventLinking(shippingInfo.city + ', ' + shippingInfo.state + ' ' + shippingInfo.zipCode)}<br>
                ${preventLinking(shippingInfo.country)}
              </div>
            </div>

            <h2 style="color:#8b7355;border-bottom:2px solid #8b7355;padding-bottom:10px;">
              🛒 Items Ordered (${items.length})
            </h2>
            <ul>${itemsList}</ul>

            <div class="totals-box">
              <p>
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
              </p>
              <p>
                <span>Tax (6%):</span>
                <span>$${tax.toFixed(2)}</span>
              </p>
              <p class="total-line">
                <span>TOTAL PAID:</span>
                <span>$${total}</span>
              </p>
            </div>
            
            <div class="return-policy">
              <h3>⚠️ RETURN POLICY</h3>
              <p style="margin:0;">
                All sales are final. There are no refunds on any items from 4EverLilys 
                unless your order is canceled within 24 hours of purchase.
              </p>
            </div>
          </div>

          <div class="footer">
            <p>Order received on ${formattedDate}</p>
            <p><strong>4EverLilys Wood Crafts</strong></p>
            <p>Handcrafted with care 🪵✨</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const subject = `🛒 New Order - ${shippingInfo.firstName} ${shippingInfo.lastName} - $${total}`;

    // Send email via Resend
    console.log('📧 Sending email via Resend...');
    
    const info = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.BUSINESS_EMAIL || 'smackanalex@gmail.com',
      subject,
      html: emailContent,
    });

    const messageId = info?.id || info?.data?.id || 'email-sent';
    console.log('✅ Order email sent with images:', messageId);

    return { 
      success: true, 
      messageId: messageId,
    };

  } catch (error) {
    console.error('❌ Error sending email:', error);
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