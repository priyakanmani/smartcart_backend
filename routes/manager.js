const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Manager = require('../models/Manager');
const Cart = require('../models/Cart');

const router = express.Router();

// --- Admin auth middleware ---
const verifyAdmin = (req, res, next) => {
  const token = req.cookies?.adminToken || (req.headers.authorization || '').split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Admin unauthorized' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = payload.id;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid admin token' });
  }
};
// --- Manager login ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const manager = await Manager.findOne({ email });
    if (!manager) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, manager.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: manager._id, role: 'manager', shopId: manager.shop.id},
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      manager: {
        id: manager._id,
        managerName: manager.managerName,
        email: manager.email,
        shop: manager.shop,
        assignedCarts: manager.assignedCarts
      }
    });
  } catch (err) {
    console.error('Manager login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});
// --- Get manager profile by email ---
router.get('/profile', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const manager = await Manager.findOne({ email }).select('-password');
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    res.json(manager);
  } catch (err) {
    console.error('Error fetching manager profile:', err);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// --- Admin login ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie('adminToken', token, {
      httpOnly: true,
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    });

    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// --- Add manager + shop ---
router.post('/add-manager', verifyAdmin, async (req, res) => {
  try {
    const { managerName, email, password, shop, assignedCarts } = req.body;

    if (!managerName || !email || !password || !shop) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if manager already exists
    const existingManager = await Manager.findOne({ email });
    if (existingManager) {
      return res.status(409).json({ message: 'Manager with that email already exists' });
    }

    // Check if shop ID already exists
    if (shop && shop.id) {
      const existingShop = await Manager.findOne({ 'shop.id': shop.id });
      if (existingShop) {
        return res.status(409).json({ message: 'Shop ID already exists' });
      }
    }

    // Validate carts exist and are available
    if (assignedCarts && assignedCarts.length > 0) {
      const availableCarts = await Cart.countDocuments({
        cart_id: { $in: assignedCarts },
        status: 'Available'
      });
      if (availableCarts !== assignedCarts.length) {
        return res.status(400).json({ message: 'One or more carts are not available' });
      }
    }

    const manager = new Manager({
      managerName,
      email,
      password,
      shop: {
        name: shop.name,
        id: shop.id,
        address: shop.address,
        phone: shop.phone,
      },
      assignedCarts: assignedCarts || [],
    });

    await manager.save();

    if (manager.assignedCarts.length > 0) {
      await Cart.updateMany(
        { cart_id: { $in: manager.assignedCarts } },
        { $set: { status: 'In Use' } }
      );
    }

    const safeManager = manager.toObject();
    delete safeManager.password;

    res.status(201).json({ 
      message: 'Manager created successfully',
      manager: safeManager 
    });
  } catch (err) {
    console.error('Add manager error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error adding manager' });
  }
});

// --- Update manager ---
router.put('/manager/:id', verifyAdmin, async (req, res) => {
  try {
    const { managerName, email, password, shop, assignedCarts } = req.body;
    const updates = {};

    if (managerName) updates.managerName = managerName;
    if (email) updates.email = email;
    
    // Handle shop updates including shop ID
    if (shop) {
      updates.shop = {};
      if (shop.name !== undefined) updates.shop.name = shop.name;
      if (shop.id !== undefined) updates.shop.id = shop.id;
      if (shop.address !== undefined) updates.shop.address = shop.address;
      if (shop.phone !== undefined) updates.shop.phone = shop.phone;
      
      // Check if shop ID is being changed to one that already exists
      if (shop.id) {
        const existingShop = await Manager.findOne({ 
          'shop.id': shop.id, 
          _id: { $ne: req.params.id } 
        });
        if (existingShop) {
          return res.status(409).json({ message: 'Shop ID already exists' });
        }
      }
    }

    if (assignedCarts !== undefined) {
      // Validate carts if updating
      if (assignedCarts.length > 0) {
        const availableCarts = await Cart.countDocuments({
          cart_id: { $in: assignedCarts },
          status: 'Available'
        });
        if (availableCarts !== assignedCarts.length) {
          const managerCarts = await Manager.findOne({
            _id: req.params.id,
            assignedCarts: { $in: assignedCarts }
          });
          if (!managerCarts) {
            return res.status(400).json({ message: 'One or more carts are not available' });
          }
        }
      }
      updates.assignedCarts = assignedCarts;
    }

    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const previousManager = await Manager.findById(req.params.id);
    const manager = await Manager.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!manager) return res.status(404).json({ message: 'Manager not found' });

    // Update cart statuses
    if (assignedCarts !== undefined && previousManager) {
      const cartsToRelease = previousManager.assignedCarts.filter(
        cartId => !manager.assignedCarts.includes(cartId)
      );
      if (cartsToRelease.length > 0) {
        await Cart.updateMany(
          { cart_id: { $in: cartsToRelease } },
          { $set: { status: 'Available' } }
        );
      }

      const cartsToAssign = manager.assignedCarts.filter(
        cartId => !previousManager.assignedCarts.includes(cartId)
      );
      if (cartsToAssign.length > 0) {
        await Cart.updateMany(
          { cart_id: { $in: cartsToAssign } },
          { $set: { status: 'In Use' } }
        );
      }
    }

    res.json({ 
      message: 'Manager updated successfully',
      manager 
    });
  } catch (err) {
    console.error('Update manager error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error updating manager' });
  }
});

// --- Delete manager ---
router.delete('/manager/:id', verifyAdmin, async (req, res) => {
  try {
    const manager = await Manager.findById(req.params.id);
    if (!manager) return res.status(404).json({ message: 'Manager not found' });

    if (manager.assignedCarts?.length > 0) {
      await Cart.updateMany(
        { cart_id: { $in: manager.assignedCarts } },
        { $set: { status: 'Available' } }
      );
    }

    await Manager.findByIdAndDelete(req.params.id);
    res.json({ message: 'Manager deleted successfully' });
  } catch (err) {
    console.error('Delete manager error:', err);
    res.status(500).json({ message: 'Server error deleting manager' });
  }
});

// --- List managers ---
router.get('/managers', verifyAdmin, async (req, res) => {
  try {
    const managers = await Manager.find()
      .sort({ createdAt: -1 })
      .select('-password')
      .lean();

    const managersWithCarts = await Promise.all(
      managers.map(async manager => {
        const carts = await Cart.find({
          cart_id: { $in: manager.assignedCarts || [] }
        }).select('cart_id status location').lean();
        return { ...manager, assignedCarts: carts };
      })
    );

    res.json({ managers: managersWithCarts });
  } catch (err) {
    console.error('Fetch managers error:', err);
    res.status(500).json({ message: 'Server error fetching managers' });
  }
});

// --- Get manager by ID ---
router.get('/manager/:id', verifyAdmin, async (req, res) => {
  try {
    const manager = await Manager.findById(req.params.id).select('-password');
    
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }
    
    res.json(manager);
  } catch (err) {
    console.error('Error fetching manager:', err);
    res.status(500).json({ message: 'Server error fetching manager' });
  }
});

module.exports = router;