const express = require('express');

const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  uploadBootcampImage,
} = require('../controllers/bootcamps');

const { protect } = require('../middleware/auth');

const Bootcamp = require('../models/Bootcamp');

const query = require('../middleware/query');

// Include other resource routers
const courseRouter = require('./courses');

const router = express.Router();

// Re-route anything with bootcampId/courses* rerouted to course router
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router
  .route('/')
  .get(query(Bootcamp, 'courses'), getBootcamps)
  .post(protect, createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, updateBootcamp)
  .delete(protect, deleteBootcamp);

router.route('/:id/photo').put(protect, uploadBootcampImage);

module.exports = router;
