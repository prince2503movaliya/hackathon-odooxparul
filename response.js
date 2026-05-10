const express = require('express');
const authRoutes = require('./authRoutes');
const tripRoutes = require('./tripRoutes');
const cityRoutes = require('./cityRoutes');
const tripController = require('../controllers/tripController');

const dashboardRoutes = require('./dashboardRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy', timestamp: new Date().toISOString() });
});

/**
 * Publicly shared trip access
 */
router.get('/shared/:slug', tripController.getShared);

// Mount modules
router.use('/auth', authRoutes);
router.use('/trips', tripRoutes);
router.use('/cities', cityRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
