
// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const Cart = require("./models/Cart");
const managerRoutes = require('./routes/manager');
dotenv.config();
const productRoutes = require('./routes/products');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:5173', // frontend origin
    credentials: true,
  })
);

// Mount admin routes
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);
// Mount carts routes
const cartRoutes = require('./routes/carts');
app.use('/api/carts', cartRoutes);
app.use('/api/manager', managerRoutes); // All manager routes will be prefixed with /api/manager
// Routes

// Use routes
app.use('/api/products', productRoutes);
// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});


// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
