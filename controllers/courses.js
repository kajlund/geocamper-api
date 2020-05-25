const { CustomError } = require('../utils/errors');
const wrap = require('../middleware/wrap');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// @desc      Get courses
// @route     GET /api/v1/courses
// @route     GET /api/v1/bootcamps/:bootcampId/courses
// @access    Public
exports.getCourses = wrap(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });
    res.status(200).json({ success: true, count: courses.length, data: courses });
  } else {
    res.status(200).json(res.results);
  }
});

// @desc      Get single course
// @route     GET /api/v1/courses/:id
// @access    Private
exports.getCourse = wrap(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!course) {
    throw new CustomError(`Not Found. Course id: ${req.params.id}`, 404);
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc      Add course
// @route     POST /api/v1/bootcamps/:bootcampId/courses
// @access    Private
exports.addCourse = wrap(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    throw new CustomError(`Not Found. Bootcamp id: ${req.params.bootcampId}`, 404);
  }

  const course = await Course.create(req.body);
  res.status(200).json({ success: true, data: course });
});

// @desc      Update course
// @route     PUT /api/v1/courses/:id
// @access    Private
exports.updateCourse = wrap(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    throw new CustomError(`Not Found. Course id: ${req.params.id}`, 404);
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: course });
});

// @desc      Delete course
// @route     DELETE /api/v1/courses/:id
// @access    Private
exports.deleteCourse = wrap(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    throw new CustomError(`Not Found. Course id: ${req.params.id}`, 404);
  }

  await course.remove();
  res.status(200).json({ success: true, data: {} });
});
