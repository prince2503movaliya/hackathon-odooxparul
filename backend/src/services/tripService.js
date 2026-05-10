const tripRepository = require('../repositories/tripRepository');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const { nanoid } = require('nanoid');

const tripService = {
  async createTrip(userId, data, file) {
    const formattedData = {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      currency: data.currency || 'USD',
      userId,
    };
    if (file) formattedData.coverImage = `/uploads/covers/${file.filename}`;
    return tripRepository.create(formattedData);
  },

  async getTrip(tripId, userId) {
    const trip = await tripRepository.findById(tripId);
    if (!trip) throw new NotFoundError('Trip');

    // Check access
    if (trip.userId !== userId && trip.visibility !== 'PUBLIC' && !trip.shared) {
      throw new ForbiddenError('You do not have access to this trip');
    }

    return trip;
  },

  async listUserTrips(userId, pagination) {
    const skip = (pagination.page - 1) * pagination.limit;
    return tripRepository.findAllByUserId(userId, { skip, take: pagination.limit });
  },

  async updateTrip(tripId, userId, data, file) {
    const trip = await tripRepository.findById(tripId);
    if (!trip) throw new NotFoundError('Trip');
    if (trip.userId !== userId) throw new ForbiddenError();

    const updateData = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (file) updateData.coverImage = `/uploads/covers/${file.filename}`;

    return tripRepository.update(tripId, updateData);
  },

  async deleteTrip(tripId, userId) {
    const trip = await tripRepository.findById(tripId);
    if (!trip) throw new NotFoundError('Trip');
    if (trip.userId !== userId) throw new ForbiddenError();

    return tripRepository.delete(tripId);
  },

  // Stops
  async addStop(tripId, userId, stopData) {
    const trip = await tripRepository.findById(tripId);
    if (!trip) throw new NotFoundError('Trip');
    if (trip.userId !== userId) throw new ForbiddenError();

    const arrivalDate = new Date(stopData.arrivalDate);
    const departureDate = new Date(stopData.departureDate);

    // 1. Check if stop dates are within trip dates
    if (arrivalDate < new Date(trip.startDate) || departureDate > new Date(trip.endDate)) {
      throw new Error('Stop dates must be within the trip range (' +
        trip.startDate.toISOString().split('T')[0] + ' to ' +
        trip.endDate.toISOString().split('T')[0] + ')');
    }

    // 2. Check for overlaps with existing stops
    const existingStops = trip.stops || [];
    const hasOverlap = existingStops.some(stop => {
      const existingArrival = new Date(stop.arrivalDate);
      const existingDeparture = new Date(stop.departureDate);

      return (arrivalDate < existingDeparture && departureDate > existingArrival);
    });

    if (hasOverlap) {
      throw new Error('This stop overlaps with an existing stop in your itinerary');
    }

    const stopWithDates = {
      ...stopData,
      arrivalDate,
      departureDate,
    };

    return tripRepository.addStop(tripId, stopWithDates);
  },

  async deleteStop(stopId, userId) {
    // Find the trip containing this stop to check ownership
    const stop = await tripRepository.findStopById(stopId);
    if (!stop) throw new NotFoundError('Stop');

    const trip = await tripRepository.findById(stop.tripId);
    if (!trip) throw new NotFoundError('Trip');
    if (trip.userId !== userId) throw new ForbiddenError();

    return tripRepository.deleteStop(stopId);
  },

  async reorderStops(userId, tripId, stops) {
    const trip = await tripRepository.findById(tripId);
    if (!trip) throw new NotFoundError('Trip');
    if (trip.userId !== userId) throw new ForbiddenError();

    return tripRepository.reorderStops(tripId, stops);
  },

  // Budget
  async updateBudget(tripId, userId, budgetData) {
    const trip = await tripRepository.findById(tripId);
    if (!trip) throw new NotFoundError('Trip');
    if (trip.userId !== userId) throw new ForbiddenError();

    const updatedBudget = await tripRepository.updateBudget(tripId, budgetData);

    // Add alert if over budget
    const result = { ...updatedBudget };
    if (trip.targetBudget && updatedBudget.totalCost > trip.targetBudget) {
      result.alert = `Warning: You are over your target budget of ${trip.targetBudget}!`;
      result.isOverBudget = true;
    } else {
      result.isOverBudget = false;
    }

    return result;
  },

  // Sharing
  async shareTrip(tripId, userId) {
    const trip = await tripRepository.findById(tripId);
    if (!trip) throw new NotFoundError('Trip');
    if (trip.userId !== userId) throw new ForbiddenError();

    if (trip.shared) return trip.shared;

    const slug = nanoid(10);
    return tripRepository.createSharedLink(tripId, slug);
  },

  async getSharedTrip(slug) {
    const shared = await tripRepository.findByShareSlug(slug);
    if (!shared || !shared.isPublic) throw new NotFoundError('Shared trip');
    return shared.trip;
  },

  async copyTrip(slug, userId) {
    const shared = await tripRepository.findByShareSlug(slug);
    if (!shared) throw new NotFoundError('Shared trip');

    const trip = shared.trip;

    // Create new trip based on shared one
    const newTrip = await tripRepository.create({
      userId,
      title: `Copy of ${trip.title}`,
      description: trip.description,
      startDate: trip.startDate,
      endDate: trip.endDate,
      coverImage: trip.coverImage,
      status: 'planning',
      visibility: 'PRIVATE'
    });

    // Copy stops and activities
    for (const stop of trip.stops) {
      const newStop = await tripRepository.addStop(newTrip.id, {
        cityId: stop.cityId,
        arrivalDate: stop.arrivalDate,
        departureDate: stop.departureDate,
        stopOrder: stop.stopOrder
      });

      // Copy activities
      for (const sa of stop.activities) {
        await tripRepository.addStopActivity(newStop.id, {
          activityId: sa.activityId,
          scheduledTime: sa.scheduledTime,
          customNotes: sa.customNotes,
          day: sa.day
        });
      }
    }

    return newTrip;
  },

  // Packing List
  async addPackingItem(tripId, userId, data) {
    const trip = await tripRepository.findById(tripId);
    if (!trip) throw new NotFoundError('Trip');
    if (trip.userId !== userId) throw new ForbiddenError();
    return tripRepository.addPackingItem(tripId, data);
  },

  async updatePackingItem(tripId, userId, itemId, data) {
    const trip = await tripRepository.findById(tripId);
    if (!trip) throw new NotFoundError('Trip');
    if (trip.userId !== userId) throw new ForbiddenError();
    return tripRepository.updatePackingItem(itemId, data);
  },

  async deletePackingItem(tripId, userId, itemId) {
    const trip = await tripRepository.findById(tripId);
    if (!trip) throw new NotFoundError('Trip');
    if (trip.userId !== userId) throw new ForbiddenError();
    return tripRepository.deletePackingItem(itemId);
  },

  // Notes
  async addNote(tripId, userId, data) {
    const trip = await tripRepository.findById(tripId);
    if (!trip) throw new NotFoundError('Trip');
    if (trip.userId !== userId) throw new ForbiddenError();
    return tripRepository.addNote(tripId, data);
  },

  async updateNote(tripId, userId, noteId, data) {
    const trip = await tripRepository.findById(tripId);
    if (!trip) throw new NotFoundError('Trip');
    if (trip.userId !== userId) throw new ForbiddenError();
    return tripRepository.updateNote(noteId, data);
  },

  async deleteNote(tripId, userId, noteId) {
    const trip = await tripRepository.findById(tripId);
    if (!trip) throw new NotFoundError('Trip');
    if (trip.userId !== userId) throw new ForbiddenError();
    return tripRepository.deleteNote(noteId);
  },

  // Activities
  async addActivity(tripId, userId, stopId, data) {
    const trip = await tripRepository.findById(tripId);
    if (!trip) throw new NotFoundError('Trip');
    if (trip.userId !== userId) throw new ForbiddenError();

    // Ensure stop belongs to trip
    const stop = await tripRepository.findStopById(stopId);
    if (!stop || stop.tripId !== tripId) throw new Error('Stop does not belong to this trip');

    const stopActivity = await tripRepository.addStopActivity(stopId, data);
    await tripRepository.syncTripBudget(tripId);
    return stopActivity;
  },

  async deleteActivity(tripId, userId, activityId) {
    const trip = await tripRepository.findById(tripId);
    if (!trip) throw new NotFoundError('Trip');
    if (trip.userId !== userId) throw new ForbiddenError();

    await tripRepository.deleteStopActivity(activityId);
    await tripRepository.syncTripBudget(tripId);
    return true;
  },
};

module.exports = tripService;
