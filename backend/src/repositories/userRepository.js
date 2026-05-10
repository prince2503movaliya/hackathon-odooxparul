const prisma = require('../config/prisma');

const userRepository = {
  async findById(id) {
    return prisma.user.findUnique({ where: { id } });
  },

  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  },

  async create(data) {
    return prisma.user.create({ data });
  },

  async update(id, data) {
    return prisma.user.update({ where: { id }, data });
  },

  async delete(id) {
    return prisma.user.delete({ where: { id } });
  },

  async findAll({ skip, take }) {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          profilePhoto: true,
          languagePreference: true,
          createdAt: true,
          _count: { select: { trips: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);
    return { users, total };
  },
};

const refreshTokenRepository = {
  async create(data) {
    return prisma.refreshToken.create({ data });
  },

  async findByToken(token) {
    return prisma.refreshToken.findUnique({ where: { token } });
  },

  async deleteByToken(token) {
    return prisma.refreshToken.deleteMany({ where: { token } });
  },

  async deleteByUserId(userId) {
    return prisma.refreshToken.deleteMany({ where: { userId } });
  },

  async deleteExpired() {
    return prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  },
};

const passwordResetRepository = {
  async create(data) {
    return prisma.passwordResetToken.create({ data });
  },

  async findByToken(token) {
    return prisma.passwordResetToken.findUnique({ where: { token } });
  },

  async deleteByEmail(email) {
    return prisma.passwordResetToken.deleteMany({ where: { email } });
  },

  async deleteExpired() {
    return prisma.passwordResetToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  },
};

module.exports = { userRepository, refreshTokenRepository, passwordResetRepository };
