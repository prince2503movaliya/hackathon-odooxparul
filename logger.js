const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const prisma = require('../config/prisma');

const router = express.Router();

router.use(authenticate);

router.get('/stats', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  const [tripCount, totalBudget, upcomingTrips] = await Promise.all([
    prisma.trip.count({ where: { userId } }),
    prisma.budget.aggregate({
      where: { trip: { userId } },
      _sum: { totalCost: true }
    }),
    prisma.trip.findMany({
      where: { 
        userId, 
        startDate: { gte: new Date() } 
      },
      orderBy: { startDate: 'asc' },
      take: 3,
      include: { _count: { select: { stops: true } } }
    })
  ]);

  success(res, {
    summary: {
      totalTrips: tripCount,
      totalSpent: totalBudget._sum.totalCost || 0,
      upcomingCount: upcomingTrips.length
    },
    upcomingTrips
  });
}));

module.exports = router;
