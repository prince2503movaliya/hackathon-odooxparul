const authService = require('../services/authService');
const { created, success } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const authController = {
  register: asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);
    created(res, user, 'User registered successfully');
  }),

  login: asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.login(req.body.email, req.body.password);
    success(res, { user, accessToken, refreshToken }, 'Logged in successfully');
  }),

  logout: asyncHandler(async (req, res) => {
    await authService.logout(req.body.refreshToken);
    success(res, null, 'Logged out successfully');
  }),

  refresh: asyncHandler(async (req, res) => {
    const { accessToken } = await authService.refresh(req.body.refreshToken);
    success(res, { accessToken }, 'Token refreshed successfully');
  }),

  forgotPassword: asyncHandler(async (req, res) => {
    await authService.forgotPassword(req.body.email);
    success(res, null, 'Password reset link sent to your email');
  }),

  getProfile: asyncHandler(async (req, res) => {
    success(res, req.user);
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const user = await authService.updateProfile(req.user.id, req.body, req.file);
    success(res, user, 'Profile updated successfully');
  }),

  deleteAccount: asyncHandler(async (req, res) => {
    await authService.deleteAccount(req.user.id);
    success(res, null, 'Account deleted successfully');
  }),
};

module.exports = authController;
