const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory list of iPhones (sample) with real image URLs (Unsplash).
// If you prefer to serve local images, put them in public/images and replace the img fields with '/images/your-image.png'
let iphones = [
  {
    id: 'ip14',
    name: 'iPhone 14',
    storage: '128GB',
    price: 699,
    stock: 5,
    img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'ip14p',
    name: 'iPhone 14 Pro',
    storage: '256GB',
    price: 999,
    stock: 3,
    img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'ip13',
    name: 'iPhone 13',
    storage: '128GB',
    price: 599,
    stock: 8,
    img: 'https://images.unsplash.com/photo-1520975682487-3f1c48e47a09?auto=format&fit=crop&w=800&q=80'
  }
];

// Simple orders store (in-memory)
const orders = [];

// API: list iphones
app.get('/api/iphones', (req, res) => {
  res.json(iphones);
});

// API: purchase an iphone
app.post('/api/purchase', (req, res) => {
  const { id, quantity = 1, buyer } = req.body;
  if (!id || !buyer || !buyer.name || !buyer.email) {
    return res.status(400).json({ error: 'Missing purchase info: id and buyer (name,email) required.' });
  }
  const phone = iphones.find(p => p.id === id);
  if (!phone) return res.status(404).json({ error: 'Product not found.' });
  if (quantity <= 0 || quantity > phone.stock) {
    return res.status(400).json({ error: `Invalid quantity. Available stock: ${phone.stock}` });
  }
  // decrement stock
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

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`iPhone buyer app running on http://localhost:${PORT}`);
});
