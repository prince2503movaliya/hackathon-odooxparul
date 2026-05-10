const tripService = require('../services/tripService');
const { created, success, paginated } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const tripController = {
  create: asyncHandler(async (req, res) => {
    const trip = await tripService.createTrip(req.user.id, req.body, req.file);
    created(res, trip, 'Trip created successfully');
  }),

  list: asyncHandler(async (req, res) => {
    const { trips, total } = await tripService.listUserTrips(req.user.id, req.query);
    paginated(res, trips, { total, page: req.query.page, limit: req.query.limit });
  }),

  get: asyncHandler(async (req, res) => {
    const trip = await tripService.getTrip(req.params.id, req.user.id);
    success(res, trip);
  }),

  update: asyncHandler(async (req, res) => {
    const trip = await tripService.updateTrip(req.params.id, req.user.id, req.body, req.file);
    success(res, trip, 'Trip updated successfully');
  }),

  delete: asyncHandler(async (req, res) => {
    await tripService.deleteTrip(req.params.id, req.user.id);
    success(res, null, 'Trip deleted successfully');
  }),

  // Stops
  addStop: asyncHandler(async (req, res) => {
    const stop = await tripService.addStop(req.params.id, req.user.id, req.body);
    created(res, stop, 'Stop added successfully');
  }),

  deleteStop: asyncHandler(async (req, res) => {
    await tripService.deleteStop(req.params.stopId, req.user.id);
    success(res, null, 'Stop removed successfully');
  }),

  reorderStops: asyncHandler(async (req, res) => {
    await tripService.reorderStops(req.user.id, req.body.tripId, req.body.stops);
    success(res, null, 'Stops reordered successfully');
  }),

  // Budget
  updateBudget: asyncHandler(async (req, res) => {
    const budget = await tripService.updateBudget(req.params.id, req.user.id, req.body);
    success(res, budget, 'Budget updated successfully');
  }),

  // Share
  share: asyncHandler(async (req, res) => {
    const shared = await tripService.shareTrip(req.params.id, req.user.id);
    success(res, shared, 'Trip sharing link generated');
  }),

  getShared: asyncHandler(async (req, res) => {
    const trip = await tripService.getSharedTrip(req.params.slug);
    success(res, trip);
  }),

  // Packing List
  addPackingItem: asyncHandler(async (req, res) => {
    const item = await tripService.addPackingItem(req.params.id, req.user.id, req.body);
    created(res, item, 'Item added to packing list');
  }),

  updatePackingItem: asyncHandler(async (req, res) => {
    const item = await tripService.updatePackingItem(req.params.id, req.user.id, req.params.itemId, req.body);
    success(res, item, 'Packing item updated');
  }),

  deletePackingItem: asyncHandler(async (req, res) => {
    await tripService.deletePackingItem(req.params.id, req.user.id, req.params.itemId);
    success(res, null, 'Packing item removed');
  }),

  // Notes
  addNote: asyncHandler(async (req, res) => {
    const note = await tripService.addNote(req.params.id, req.user.id, req.body);
    created(res, note, 'Note added');
  }),

  updateNote: asyncHandler(async (req, res) => {
    const note = await tripService.updateNote(req.params.id, req.user.id, req.params.noteId, req.body);
    success(res, note, 'Note updated');
  }),

  deleteNote: asyncHandler(async (req, res) => {
    await tripService.deleteNote(req.params.id, req.user.id, req.params.noteId);
    success(res, null, 'Note deleted');
  }),

  // Activities
  addActivity: asyncHandler(async (req, res) => {
    // We need to implement addActivity in tripService first or call repo directly
    // Let's add it to tripService for consistency
    const activity = await tripService.addActivity(req.params.id, req.user.id, req.params.stopId, req.body);
    created(res, activity, 'Activity added to itinerary');
  }),

  deleteActivity: asyncHandler(async (req, res) => {
    await tripService.deleteActivity(req.params.id, req.user.id, req.params.activityId);
    success(res, null, 'Activity removed from itinerary');
  }),
};

module.exports = tripController;
