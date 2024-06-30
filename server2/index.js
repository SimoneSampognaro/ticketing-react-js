'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const cors = require('cors');
const { check, validationResult } = require('express-validator'); // validation middleware

const { expressjwt: jwt } = require('express-jwt');

const jwtSecret = '6xvL4xkAAbG49hcXf5GIYSvkDICiUAR6EdR5dLdwW7hMzUjjMUe9t6M5kSAYxsvX';

// init express
const app = express();
const port = 3002;

const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json()); // To automatically decode incoming json

// Check token validity
app.use(jwt({
  secret: jwtSecret,
  algorithms: ["HS256"],
  // token from HTTP Authorization: header
})
);

function estimateTime(ticketTitle, ticketCategory, authAccessLevel) {
  // Function to remove spaces from a string
  function removeSpaces(str) {
      return str.replace(/\s+/g, '');
  }

  // Calculate the number of characters excluding spaces
  const titleLength = removeSpaces(ticketTitle).length;
  const categoryLength = removeSpaces(ticketCategory).length;

  // Calculate the sum of characters
  const totalCharacters = titleLength + categoryLength;

  // Multiply by 10
  let estimatedValue = totalCharacters * 10;

  // Add a uniformly distributed random number between 1 and 240
  const randomValue = Math.floor(Math.random() * 240) + 1;
  estimatedValue += randomValue;

  // If the user is not an administrator, round to the nearest integer number of days
  if (authAccessLevel === "normal") {
      const hoursPerDay = 24;
      estimatedValue = Math.round(estimatedValue / hoursPerDay);
  }

  return estimatedValue;
}

// To return a better object in case of errors
app.use( function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    // Example of err content:  {"code":"invalid_token","status":401,"name":"UnauthorizedError","inner":{"name":"TokenExpiredError","message":"jwt expired","expiredAt":"2024-05-23T19:23:58.000Z"}}
    res.status(401).json({ errors: [{  'param': 'Server', 'msg': 'Authorization error', 'path': err.code }] });
  } else {
    next();
  }
} );


/*** APIs ***/

app.post('/api/estimations', 
  [
    check('*.category').notEmpty().isString(), 
    check('*.title').notEmpty().isString(),
  ], 
  async (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
        return res.status(422).json(errors.errors);
    }

    const access = req.auth.access;
    const estimations = req.body.map(item => {
      const estimation = estimateTime(item.title, item.category, access);
      return { id: item.id, estimation: estimation };
    });

    res.json(estimations);
});


/*** Other express-related instructions ***/

// Activate the server
app.listen(port, () => {
  console.log(`estimation-server listening at http://localhost:${port}`);
});