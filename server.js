const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const cors = require('cors');

// Import the full iPhone catalog
const iphones = require('./data/iphones');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// clone the imported list into an in-memory store we can mutate (stock/order)
let products = iphones.map(p => ({ ...p }));

const orders = [];

// API: list iphones
app.get('/api/iphones', (req, res) => {
  res.json(products);
});

// API: purchase an iphone
app.post('/api/purchase', (req, res) => {
  const { id, quantity = 1, buyer } = req.body;
  if (!id || !buyer || !buyer.name || !buyer.email) {
    return res.status(400).json({ error: 'Missing purchase info: id and buyer (name,email) required.' });
  }
  const phone = products.find(p => p.id === id);
  if (!phone) return res.status(404).json({ error: 'Product not found.' });
  if (quantity <= 0 || quantity > phone.stock) {
    return res.status(400).json({ error: `Invalid quantity. Available stock: ${phone.stock}` });
  }
  phone.stock -= quantity;
  const order = {
    orderId: uuidv4(),
    productId: id,
    productName: phone.name,
    quantity,
    buyer,
    total: phone.price * quantity,
    createdAt: new Date().toISOString()
  };
  orders.push(order);
  res.json({ success: true, order });
});

// API: list orders (for demo)
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// Endpoint to reset demo data (dev only)
app.post('/api/reset-demo', (req, res) => {
  products = iphones.map(p => ({ ...p }));
  orders.length = 0;
  res.json({ success: true });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`iPhone buyer app running on http://localhost:${PORT}`);
});
