const cityService = require('../services/cityService');
const { success, created, paginated } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const cityController = {
  searchCities: asyncHandler(async (req, res) => {
    const { cities, total } = await cityService.searchCities(req.query, req.query);
    paginated(res, cities, { total, page: req.query.page, limit: req.query.limit });
  }),

  getCity: asyncHandler(async (req, res) => {
    const city = await cityService.getCityDetails(req.params.id);
    success(res, city);
  }),

  searchActivities: asyncHandler(async (req, res) => {
    const { activities, total } = await cityService.searchActivities(req.query, req.query);
    paginated(res, activities, { total, page: req.query.page, limit: req.query.limit });
  }),

  saveCity: asyncHandler(async (req, res) => {
    await cityService.saveCity(req.user.id, req.body.cityId);
    success(res, null, 'City saved successfully');
  }),

  unsaveCity: asyncHandler(async (req, res) => {
    await cityService.unsaveCity(req.user.id, req.params.id);
    success(res, null, 'City unsaved successfully');
  }),

  getSaved: asyncHandler(async (req, res) => {
    const saved = await cityService.getSavedCities(req.user.id);
    success(res, saved);
  }),

  addStopActivity: asyncHandler(async (req, res) => {
    const activity = await cityService.addStopActivity(req.params.id, req.body);
    created(res, activity, 'Activity added to stop');
  }),

  removeStopActivity: asyncHandler(async (req, res) => {
    await cityService.removeStopActivity(req.params.id);
    success(res, null, 'Activity removed from stop');
  }),

  removeStop: asyncHandler(async (req, res) => {
    await cityService.removeStop(req.params.id, req.user.id);
    success(res, null, 'Stop removed successfully');
  }),
};

module.exports = cityController;
