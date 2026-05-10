const express = require('express');
const cityController = require('../controllers/cityController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate, validateQuery } = require('../middlewares/validationMiddleware');
const { paginationSchema, addStopActivitySchema } = require('../validations/schemas');

const router = express.Router();

router.get('/', validateQuery(paginationSchema), cityController.searchCities);
router.get('/activities', validateQuery(paginationSchema), cityController.searchActivities);
router.get('/:id', cityController.getCity);

// Saved Cities (Protected)
router.get('/saved', authenticate, cityController.getSaved);
router.post('/save', authenticate, cityController.saveCity);
router.delete('/save/:id', authenticate, cityController.unsaveCity);

// Stop Activities (Protected)
router.post('/stops/:id/activities', authenticate, validate(addStopActivitySchema), cityController.addStopActivity);
router.delete('/stops/:id', authenticate, cityController.removeStop);
router.delete('/stop-activities/:id', authenticate, cityController.removeStopActivity);

module.exports = router;
