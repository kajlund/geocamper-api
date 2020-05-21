const Bootcamp = require('../models/Bootcamp');

const Geocoder = require('../utils/geocoder.js');
const { CustomError } = require('../utils/errors');
const wrap = require('../middleware/wrap');

// @desc   Get all Bootcamps
// @route  GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = wrap(async (req, res, next) => {
  const bootcamps = await Bootcamp.find();
  res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps });
});

// @desc   Get single Bootcamp
// @route  GET /api/v1/bootcamps/:id
// @access Public
exports.getBootcamp = wrap(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    throw new CustomError(`Not Found. Bootcamp id: ${req.params.id}`, 404);
  }
  res.status(200).json({ success: true, data: bootcamp });
});

// @desc   Create Bootcamp
// @route  POST /api/v1/bootcamps
// @access Private
exports.createBootcamp = wrap(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp });
});

// @desc   Update Bootcamp
// @route  PUT /api/v1/bootcamps/:id
// @access Private
exports.updateBootcamp = wrap(async (req, res, next) => {
  // new: true returns updated record
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!bootcamp) {
    throw new CustomError(`Not Found. Bootcamp id: ${req.params.id}`, 404);
  }
  res.status(200).json({ success: true, data: bootcamp });
});

// @desc   Delete Bootcamp
// @route  DELETE /api/v1/bootcamps/:id
// @access Private
exports.deleteBootcamp = wrap(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  if (!bootcamp) {
    throw new CustomError(`Not Found. Bootcamp id: ${req.params.id}`, 404);
  }
  res.status(200).json({ success: true, data: {} });
});

// @desc   Get Bootcamps within a radius
// @route  GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access Private
exports.getBootcampsInRadius = wrap(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from zipcode
  const loc = await Geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radiys using radian
  // Divide dist by radius of earth
  // Earth Radius = 3963mi 6378km
  const radius = distance / 6378;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps });
});
