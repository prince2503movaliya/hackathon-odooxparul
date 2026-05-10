const prisma = require('../config/prisma');

const cityRepository = {
  async findAll({ skip, take, q, region, minCost, maxCost, minPopularity }) {
    const where = {
      AND: [
        q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { country: { contains: q, mode: 'insensitive' } }] } : {},
        region && region !== 'All' ? { region } : {},
        minCost ? { costIndex: { gte: parseInt(minCost) } } : {},
        maxCost ? { costIndex: { lte: parseInt(maxCost) } } : {},
        minPopularity ? { popularityScore: { gte: parseInt(minPopularity) } } : {},
      ],
    };

    const [cities, total] = await Promise.all([
      prisma.city.findMany({
        where,
        skip,
        take,
        orderBy: { popularityScore: 'desc' },
      }),
      prisma.city.count({ where }),
    ]);

    return { cities, total };
  },

  async findById(id) {
    return prisma.city.findUnique({
      where: { id },
      include: { activities: true },
    });
  },

  async findActivitiesByCityId(cityId, { category, maxCost, maxHours }) {
    return prisma.activity.findMany({
      where: {
        cityId,
        AND: [
          category && category !== 'All' ? { category } : {},
          maxCost ? { estimatedCost: { lte: maxCost } } : {},
          maxHours ? { durationMinutes: { lte: maxHours * 60 } } : {},
        ],
      },
    });
  },

  async saveDestination(userId, cityId) {
    return prisma.savedDestination.create({
      data: { userId, cityId },
    });
  },

  async unsaveDestination(userId, cityId) {
    return prisma.savedDestination.delete({
      where: { userId_cityId: { userId, cityId } },
    });
  },

  async getSavedDestinations(userId) {
    return prisma.savedDestination.findMany({
      where: { userId },
      include: { city: true },
    });
  },
};

const activityRepository = {
  async findAll({ skip, take, q, category, maxCost, maxHours }) {
    const where = {
      AND: [
        q ? { title: { contains: q, mode: 'insensitive' } } : {},
        category && category !== 'All' ? { category } : {},
        maxCost ? { estimatedCost: { lte: parseFloat(maxCost) } } : {},
        maxHours ? { durationMinutes: { lte: parseFloat(maxHours) * 60 } } : {},
      ],
    };

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        skip,
        take,
        include: { city: true },
      }),
      prisma.activity.count({ where }),
    ]);

    return { activities, total };
  },

  async addStopActivity(tripStopId, data) {
    return prisma.stopActivity.create({
      data: { ...data, tripStopId },
      include: { activity: true },
    });
  },

  async deleteStopActivity(id) {
    return prisma.stopActivity.delete({ where: { id } });
  },
};

module.exports = { cityRepository, activityRepository };
