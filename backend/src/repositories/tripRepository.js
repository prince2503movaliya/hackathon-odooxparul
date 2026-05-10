const prisma = require('../config/prisma');

const tripRepository = {
  async create(data) {
    return prisma.trip.create({
      data: {
        ...data,
        budget: { create: {} }, // Initialize empty budget
      },
      include: { budget: true },
    });
  },

  async findById(id) {
    return prisma.trip.findUnique({
      where: { id },
      include: {
        stops: {
          include: {
            city: true,
            activities: { include: { activity: true } },
          },
          orderBy: { stopOrder: 'asc' },
        },
        budget: true,
        packingItems: true,
        notes: true,
        shared: true,
      },
    });
  },

  async findAllByUserId(userId, { skip, take }) {
    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where: { userId },
        skip,
        take,
        include: {
          stops: { select: { id: true, city: { select: { name: true } } } },
          _count: { select: { stops: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.trip.count({ where: { userId } }),
    ]);
    return { trips, total };
  },

  async update(id, data) {
    return prisma.trip.update({ where: { id }, data });
  },

  async delete(id) {
    return prisma.trip.delete({ where: { id } });
  },

  // Stop Management
  async addStop(tripId, stopData) {
    // Get the current highest stopOrder
    const lastStop = await prisma.tripStop.findFirst({
      where: { tripId },
      orderBy: { stopOrder: 'desc' },
    });

    const stopOrder = lastStop ? lastStop.stopOrder + 1 : 1;

    return prisma.tripStop.create({
      data: { 
        ...stopData, 
        tripId,
        stopOrder: stopData.stopOrder || stopOrder 
      },
      include: { city: true },
    });
  },

  async findStopById(id) {
    return prisma.tripStop.findUnique({
      where: { id },
    });
  },

  async updateStop(id, data) {
    return prisma.tripStop.update({ where: { id }, data });
  },

  async deleteStop(id) {
    return prisma.tripStop.delete({ where: { id } });
  },

  async findStopById(id) {
    return prisma.tripStop.findUnique({
      where: { id },
      select: { id: true, tripId: true },
    });
  },

  async reorderStops(tripId, stops) {
    return prisma.$transaction(
      stops.map((stop) =>
        prisma.tripStop.update({
          where: { id: stop.id, tripId },
          data: { stopOrder: stop.stopOrder },
        })
      )
    );
  },

  // Budget Management
  async updateBudget(tripId, data) {
    const budget = await prisma.budget.update({
      where: { tripId },
      data,
    });
    
    // Recalculate total
    const total = budget.transportCost + budget.accommodationCost + budget.mealCost + budget.activityCost + budget.miscellaneousCost;
    
    return prisma.budget.update({
      where: { tripId },
      data: { totalCost: total },
    });
  },

  async syncTripBudget(tripId) {
    // 1. Sum up all activity costs
    const activities = await prisma.stopActivity.findMany({
      where: { tripStop: { tripId } },
      include: { activity: true }
    });

    const activityCost = activities.reduce((sum, sa) => sum + (sa.activity?.estimatedCost || 0), 0);

    // 2. Update activityCost in Budget
    const budget = await prisma.budget.update({
      where: { tripId },
      data: { activityCost }
    });

    // 3. Recalculate total
    const total = budget.transportCost + budget.accommodationCost + budget.mealCost + budget.activityCost + budget.miscellaneousCost;
    
    return prisma.budget.update({
      where: { tripId },
      data: { totalCost: total }
    });
  },

  // Packing Management
  async addPackingItem(tripId, data) {
    return prisma.packingItem.create({ data: { ...data, tripId } });
  },

  async updatePackingItem(id, data) {
    return prisma.packingItem.update({ where: { id }, data });
  },

  async deletePackingItem(id) {
    return prisma.packingItem.delete({ where: { id } });
  },

  // Notes Management
  async addNote(tripId, data) {
    return prisma.tripNote.create({ data: { ...data, tripId } });
  },

  async updateNote(id, data) {
    return prisma.tripNote.update({ where: { id }, data });
  },

  async deleteNote(id) {
    return prisma.tripNote.delete({ where: { id } });
  },

  // Activities
  async addStopActivity(tripStopId, data) {
    return prisma.stopActivity.create({
      data: { ...data, tripStopId },
      include: { activity: true },
    });
  },

  async deleteStopActivity(id) {
    return prisma.stopActivity.delete({ where: { id } });
  },

  // Sharing
  async createSharedLink(tripId, shareSlug) {
    return prisma.sharedTrip.create({
      data: { tripId, shareSlug },
    });
  },

  async findByShareSlug(shareSlug) {
    return prisma.sharedTrip.findUnique({
      where: { shareSlug },
      include: {
        trip: {
          include: {
            stops: {
              include: { city: true, activities: { include: { activity: true } } },
              orderBy: { stopOrder: 'asc' },
            },
            budget: true,
          },
        },
      },
    });
  },
};

module.exports = tripRepository;
