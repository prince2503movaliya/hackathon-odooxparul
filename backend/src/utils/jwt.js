const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/config');

/**
 * Generate JWT access token (short-lived)
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
    issuer: 'traveloop',
  });
};

/**
 * Generate JWT refresh token (long-lived)
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: 'traveloop',
  });
};

/**
 * Verify access token - throws if invalid
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwt.accessSecret, { issuer: 'traveloop' });
};

/**
 * Verify refresh token - throws if invalid
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret, { issuer: 'traveloop' });
};

/**
 * Generate secure random reset token
 */
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateResetToken,
};
