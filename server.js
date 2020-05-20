const colors = require('colors');
const dotenv = require('dotenv');
const express = require('express');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const { CustomError } = require('./utils/errors');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

const app = express();

// Body Parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/', (req, res) => {
  res.send({ message: 'Hello from express' });
});

app.use('/api/v1/bootcamps', require('./routes/bootcamps'));

// Generic Error Handler
app.use((err, req, res, next) => {
  console.log(err.stack.red);

  let status = 500;
  let message = 'Server Error';

  // Custom Errors can be returned
  if (err instanceof CustomError) {
    status = err.status;
    message = err.message;
  }

  // Faulty Mongoose ObjectId
  if (err.name && err.name === 'CastError') {
    status = 404;
    message = `Resource not found. Faulty id: ${err.value}`;
  }

  res.status(status).json({
    success: false,
    error: message,
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`.red);
  server.close(() => process.exit(1));
});
