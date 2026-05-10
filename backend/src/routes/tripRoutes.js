const express = require('express');
const tripController = require('../controllers/tripController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate, validateQuery } = require('../middlewares/validationMiddleware');
const { 
  createTripSchema, 
  updateTripSchema, 
  createStopSchema, 
  reorderStopsSchema, 
  updateBudgetSchema, 
  paginationSchema,
  createPackingItemSchema,
  updatePackingItemSchema,
  createNoteSchema,
  updateNoteSchema,
  addStopActivitySchema
} = require('../validations/schemas');

const { uploadCover } = require('../utils/upload');

const router = express.Router();

router.use(authenticate);

router.get('/', validateQuery(paginationSchema), tripController.list);
router.post('/', uploadCover.single('coverImage'), validate(createTripSchema), tripController.create);
router.get('/:id', tripController.get);
router.put('/:id', uploadCover.single('coverImage'), validate(updateTripSchema), tripController.update);
router.delete('/:id', tripController.delete);

// Stops
router.post('/:id/stops', validate(createStopSchema), tripController.addStop);
router.delete('/:id/stops/:stopId', tripController.deleteStop);
router.patch('/stops/reorder', validate(reorderStopsSchema), tripController.reorderStops);
router.post('/:id/stops/:stopId/activities', validate(addStopActivitySchema), tripController.addActivity);
router.delete('/:id/activities/:activityId', tripController.deleteActivity);

// Budget
router.put('/:id/budget', validate(updateBudgetSchema), tripController.updateBudget);

// Share
router.post('/:id/share', tripController.share);

// Packing List
router.post('/:id/packing', validate(createPackingItemSchema), tripController.addPackingItem);
router.put('/:id/packing/:itemId', validate(updatePackingItemSchema), tripController.updatePackingItem);
router.delete('/:id/packing/:itemId', tripController.deletePackingItem);

// Notes
router.post('/:id/notes', validate(createNoteSchema), tripController.addNote);
router.put('/:id/notes/:noteId', validate(updateNoteSchema), tripController.updateNote);
router.delete('/:id/notes/:noteId', tripController.deleteNote);

module.exports = router;
