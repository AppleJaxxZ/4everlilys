const express = require('express');
const cors = require('cors');
const { Client, Environment } = require('square');
const crypto = require('crypto');
const multer = require('multer');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Setup multer for image handling
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize Square client
const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENV === 'production'
    ? Environment.Production
    : Environment.Sandbox,
});

console.log('✅ Square client initialized');



// Helper function to create or update catalog item with image
async function createCatalogItemWithImage(item) {
  try {
    // Step 1: Create the catalog object (item)
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
          item.designs?.length > 0 && `Designs: ${item.designs.map(d => d.name).join(', ')}`,
          item.category && `Category: ${item.category}`,
        ].filter(Boolean).join(' | '),
        variations: [
          {
            type: 'ITEM_VARIATION',
            id: `#${item.name.replace(/\s+/g, '_')}_var_${Date.now()}`,
            itemVariationData: {
              name: 'Standard',
              pricingType: 'FIXED_PRICING',
              priceMoney: {
                amount: Math.round((item.totalPrice || item.price || 0) * 100),
                currency: 'USD',
              },
            },
          },
        ],
      },
    };

    // Step 2: Handle image if provided
    let catalogImage = null;
    if (item.imageData || item.imageUrl) {
      // Create catalog image object
      const imageId = `#img_${Date.now()}`;
      
      if (item.imageData) {
        // If we have base64 image data
        const base64Data = item.imageData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Upload image to Square
        const imageUploadResponse = await client.catalogApi.createCatalogImage(
          {
            idempotencyKey: crypto.randomUUID(),
            image: {
              type: 'IMAGE',
              id: imageId,
              imageData: {
                name: `${item.name}_image`,
                caption: item.name,
              },
            },
          },
          {
            file: buffer,
          }
        );
        
        catalogImage = imageUploadResponse.result.image;
      } else if (item.imageUrl) {
        // If we have an image URL, we'll add it to the item description
        // Square doesn't support direct URL uploads, so we note it in description
        catalogItem.itemData.description += ` | Image: ${item.imageUrl}`;
      }
    }

    // Step 3: Create the catalog item
    const catalogResponse = await client.catalogApi.upsertCatalogObject({
      idempotencyKey: crypto.randomUUID(),
      object: catalogItem,
    });

    const createdItem = catalogResponse.result.catalogObject;

    // Step 4: If we have an uploaded image, link it to the item
    if (catalogImage) {
      await client.catalogApi.updateItemModifierLists({
        itemIds: [createdItem.id],
        modifierListsToEnable: [],
        imageIds: [catalogImage.id],
      });
    }

    return createdItem;
  } catch (error) {
    console.error('Error creating catalog item:', error);
    // Return null if catalog creation fails, payment can still proceed
    return null;
  }
}

// Main payment processing endpoint
app.post('/api/process-payment', async (req, res) => {
  const { sourceId, items } = req.body;

  if (!sourceId || !items || !Array.isArray(items)) {
    return res.status(400).json({
      success: false,
      message: 'Missing or invalid payment data.',
    });
  }

  try {

        // Step 1: Calculate subtotal
        const subtotal = items.reduce((sum, item) => {
          const price = item.totalPrice || item.price || 0;
          const quantity = item.quantity || 1;
          return sum + price * quantity;
        }, 0);
    
        // Step 2: Calculate tax and Square fee
        const taxRate = 0.06;
        const squareFeeRate = 0.029;
        const squareFixedFee = 0.30;
    
        const taxAmount = subtotal * taxRate;
        const totalBeforeFees = subtotal + taxAmount;
        const squareFee = totalBeforeFees * squareFeeRate + squareFixedFee;
        const finalTotal = totalBeforeFees + squareFee;
    
        // Step 3: Convert to cents
        const amountInCents = Math.round(finalTotal * 100);
    


    // Process each item and create catalog entries if needed
    const processedItems = [];
    
    for (const item of items) {
      // Only create catalog items for custom items
      if (item.isCustom || item.gift) {
        const catalogItem = await createCatalogItemWithImage(item);
        if (catalogItem) {
          processedItems.push({
            ...item,
            catalogId: catalogItem.id,
            variationId: catalogItem.itemData.variations[0].id,
          });
        } else {
          processedItems.push(item);
        }
      } else {
        processedItems.push(item);
      }
    }

    // Build line items for the order
    const lineItems = processedItems.map(item => {
      const lineItem = {
        name: item.name || 'Custom Item',
        quantity: (item.quantity || 1).toString(),
        basePriceMoney: {
          amount: Math.round((item.totalPrice || item.price || 0) * 100),
          currency: 'USD',
        },
        note: [
          item.gift?.name && `Gift: ${item.gift.name}`,
          item.size?.name && `Size: ${item.size.name}`,
          item.wood?.name && `Wood: ${item.wood.name}`,
          item.handle?.name && `Handle: ${item.handle.name}`,
          item.handleType?.name && `Handle Type: ${item.handleType.name}`,
          item.designs?.[0]?.name && `Design: ${item.designs[0].name}`,
          item.category && `Category: ${item.category}`,
          item.type && `Type: ${item.type}`,
          item.imageUrl && `View Image: ${item.imageUrl}`,
        ].filter(Boolean).join(' | '),
      };

      // If we created a catalog item, link it
      if (item.catalogId && item.variationId) {
        lineItem.catalogObjectId = item.variationId;
      }

      return lineItem;
    });

    // Create the order
    const orderResponse = await client.ordersApi.createOrder({
      order: {
        locationId: process.env.SQUARE_LOCATION_ID,
        lineItems,
        metadata: {
          source: 'custom_builder_app',
          hasCustomItems: items.some(i => i.isCustom || i.gift) ? 'true' : 'false',
        },
      },
    });

    const order = orderResponse.result.order;

    // Create the payment
    const paymentResponse = await client.paymentsApi.createPayment({
      sourceId,
      idempotencyKey: crypto.randomUUID(),
      locationId: process.env.SQUARE_LOCATION_ID,
      amountMoney: {
        amount: amountInCents,
        currency: 'USD',
      },
    });
    

    const payment = paymentResponse.result.payment;

    res.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: amountInCents,
        currency: payment.amountMoney.currency,
        createdAt: payment.createdAt,
        orderId: payment.orderId,
        receiptUrl: payment.receiptUrl,
        breakdown: {
          subtotal: subtotal.toFixed(2),
          tax: taxAmount.toFixed(2),
          squareFee: squareFee.toFixed(2),
          total: finalTotal.toFixed(2),
        },
      },
    });
    
  } catch (error) {
    console.error('❌ Payment failed:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment processing failed.',
      details: error.errors || [],
    });
  }
});

// Endpoint to upload image separately (optional)
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    // Upload to Square's catalog
    const imageResponse = await client.catalogApi.createCatalogImage(
      {
        idempotencyKey: crypto.randomUUID(),
        image: {
          type: 'IMAGE',
          id: `#img_${Date.now()}`,
          imageData: {
            name: req.body.name || 'Product Image',
            caption: req.body.caption || '',
          },
        },
      },
      {
        file: req.file.buffer,
      }
    );

    res.json({
      success: true,
      imageId: imageResponse.result.image.id,
      imageUrl: imageResponse.result.image.imageData.url,
    });
  } catch (error) {
    console.error('Image upload failed:', error);
    res.status(500).json({
      success: false,
      message: 'Image upload failed',
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});