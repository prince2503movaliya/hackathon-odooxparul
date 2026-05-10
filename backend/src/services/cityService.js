const { cityRepository, activityRepository } = require('../repositories/cityRepository');

const cityService = {
  async searchCities(filters, pagination) {
    const skip = (pagination.page - 1) * pagination.limit;
    return cityRepository.findAll({
      skip,
      take: pagination.limit,
      q: filters.q,
      region: filters.region,
      minCost: filters.minCost,
      maxCost: filters.maxCost,
      minPopularity: filters.minPopularity,
    });
  },

  async getCityDetails(cityId) {
    return cityRepository.findById(cityId);
  },

  async searchActivities(filters, pagination) {
    const skip = (pagination.page - 1) * pagination.limit;
    return activityRepository.findAll({
      skip,
      take: pagination.limit,
      q: filters.q,
      category: filters.category,
      maxCost: filters.maxCost,
      maxHours: filters.maxHours,
    });
  },

  async saveCity(userId, cityId) {
    return cityRepository.saveDestination(userId, cityId);
  },

  async unsaveCity(userId, cityId) {
    return cityRepository.unsaveDestination(userId, cityId);
  },

  async getSavedCities(userId) {
    return cityRepository.getSavedDestinations(userId);
  },

  async addStopActivity(tripStopId, data) {
    return activityRepository.addStopActivity(tripStopId, data);
  },

  async removeStopActivity(id) {
    return activityRepository.deleteStopActivity(id);
  },

  async removeStop(stopId, userId) {
    const tripService = require('./tripService');
    return tripService.deleteStop(stopId, userId);
  },
};

module.exports = cityService;
