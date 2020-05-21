const Bootcamp = require('../models/Bootcamp');
const log = require('consola');

const Geocoder = require('../utils/geocoder.js');
const { CustomError } = require('../utils/errors');
const wrap = require('../middleware/wrap');

// @desc   Get all Bootcamps
// @route  GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = wrap(async (req, res, next) => {
  let query;
  const reqQuery = { ...req.query };

  // Fields to exclude from filtering
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Delete removeFields from query
  removeFields.forEach((param) => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  // Create operators ($gt, $gte...)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);
  // log.info(queryStr);
  query = Bootcamp.find(JSON.parse(queryStr));

  // Select fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();
  query = query.skip(startIndex).limit(limit);

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  const bootcamps = await query;
  res
    .status(200)
    .json({ success: true, count: bootcamps.length, pagination, data: bootcamps });
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
