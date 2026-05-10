const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/adminMiddleware');

const router = express.Router();

// All admin routes are protected and require ADMIN role
router.use(authenticate);
router.use(isAdmin);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);

module.exports = router;
