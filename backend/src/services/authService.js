const bcrypt = require('bcryptjs');
const { userRepository, refreshTokenRepository, passwordResetRepository } = require('../repositories/userRepository');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, generateResetToken } = require('../utils/jwt');
const { UnauthorizedError, ConflictError } = require('../utils/errors');

const authService = {
  async register(data) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) throw new ConflictError('Email already registered');

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      languagePreference: data.languagePreference || 'en',
      currencyPreference: data.currencyPreference || 'USD',
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new UnauthorizedError('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedError('Invalid credentials');

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Store refresh token
    await refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken };
  },

  async logout(refreshToken) {
    await refreshTokenRepository.deleteByToken(refreshToken);
  },

  async refresh(token) {
    try {
      const decoded = verifyRefreshToken(token);
      const storedToken = await refreshTokenRepository.findByToken(token);
      
      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }

      const user = await userRepository.findById(decoded.userId);
      if (!user) throw new UnauthorizedError('User not found');

      const accessToken = generateAccessToken({ userId: user.id, role: user.role });
      return { accessToken };
    } catch (err) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  },

  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error('No user found with this email');
    
    // Clean up old tokens
    await passwordResetRepository.deleteByEmail(email);
    
    const token = generateResetToken();
    await passwordResetRepository.create({
      email,
      token,
      expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
    });

    // In a real app, send email
    console.log(`[PASSWORD RESET] Token for ${email}: ${token}`);
    return { message: 'Reset token generated', token }; // Returning token for hackathon testing
  },

  async resetPassword(token, newPassword) {
    const resetToken = await passwordResetRepository.findByToken(token);
    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new Error('Invalid or expired reset token');
    }

    const user = await userRepository.findByEmail(resetToken.email);
    if (!user) throw new Error('User not found');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await userRepository.update(user.id, { passwordHash });
    
    // Cleanup
    await passwordResetRepository.deleteByEmail(resetToken.email);
    return true;
  },

  async updateProfile(userId, data, file) {
    const updateData = { ...data };
    if (file) updateData.profilePhoto = `/uploads/profiles/${file.filename}`;
    
    const user = await userRepository.update(userId, updateData);
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async deleteAccount(userId) {
    return userRepository.delete(userId);
  },
};

module.exports = authService;
