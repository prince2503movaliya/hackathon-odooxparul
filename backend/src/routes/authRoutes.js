const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { registerSchema, loginSchema, updateProfileSchema, forgotPasswordSchema } = require('../validations/schemas');
const { authLimiter } = require('../middlewares/rateLimiter');
const { uploadProfile } = require('../utils/upload');

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);

router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, uploadProfile.single('profilePhoto'), validate(updateProfileSchema), authController.updateProfile);
router.delete('/profile', authenticate, authController.deleteAccount);

module.exports = router;
