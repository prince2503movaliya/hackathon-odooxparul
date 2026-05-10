const prisma = require('../config/prisma');
const { success } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const adminController = {
  getStats: asyncHandler(async (req, res) => {
    const [
      totalUsers,
      totalTrips,
      totalCities,
      popularCities,
      recentUsers,
      recentTrips
    ] = await Promise.all([
      prisma.user.count(),
      prisma.trip.count(),
      prisma.city.count(),
      prisma.city.findMany({
        take: 5,
        orderBy: { tripStops: { _count: 'desc' } },
        select: {
          id: true,
          name: true,
          country: true,
          _count: { select: { tripStops: true } }
        }
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, createdAt: true }
      }),
      prisma.trip.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } }
      })
    ]);

    success(res, {
      counts: {
        users: totalUsers,
        trips: totalTrips,
        cities: totalCities
      },
      popularCities,
      recentUsers,
      recentTrips
    }, 'Admin statistics retrieved');
  }),

  getUsers: asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: { select: { trips: true } }
        }
      }),
      prisma.user.count()
    ]);

    success(res, { users, total, page: parseInt(page), limit: parseInt(limit) }, 'User list retrieved');
  }),
};

module.exports = adminController;
