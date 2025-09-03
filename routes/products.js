




const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT and attach user data
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Expecting "Bearer <token>"
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    console.log("🔑 Decoded JWT:", decoded); // 👀 See exactly what’s inside
    req.user = decoded; // decoded contains { id, shopId, ... }
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// ✅ Add a new product (protected route)
router.post('/', auth, async (req, res) => {
  try {
    const { name, category, price, stock, description, barcode, image } = req.body;

    if (!req.user.shopId) {
      return res.status(400).json({ msg: 'Shop ID not found in token' });
    }

    const product = new Product({
      name,
      category,
      price,
      stock,
      description,
      barcode,
      image,
      shop: req.user.shopId, // ✅ Use shopId directly
    });

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// ✅ Get all products of a shop (protected route)
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user.shopId) {
      return res.status(400).json({ msg: 'Shop ID not found in token' });
    }

    const products = await Product.find({ shop: req.user.shopId });
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});
// ✅ Update a product by ID (protected route)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!req.user.shopId) {
      return res.status(400).json({ msg: 'Shop ID not found in token' });
    }

    // Ensure product belongs to the logged-in shop
    const product = await Product.findOneAndUpdate(
      { _id: id, shop: req.user.shopId },
      { $set: updates },
      { new: true } // return updated document
    );

    if (!product) {
      return res.status(404).json({ msg: 'Product not found or unauthorized' });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// ✅ Delete a product by ID (protected route)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user.shopId) {
      return res.status(400).json({ msg: 'Shop ID not found in token' });
    }

    const product = await Product.findOneAndDelete({
      _id: id,
      shop: req.user.shopId,
    });

    if (!product) {
      return res.status(404).json({ msg: 'Product not found or unauthorized' });
    }

    res.json({ msg: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
