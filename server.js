const dotenv = require('dotenv');
const express = require('express');
const morgan = require('morgan');

dotenv.config({ path: './config/config.env' });

const app = express();

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/', (req, res) => {
  res.send({ message: 'Hello from express' });
});

app.use('/api/v1/bootcamps', require('./routes/bootcamps'));

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
