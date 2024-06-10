'use strict';

// git add . ; git commit -m "title" ; git push

const express = require('express');
const morgan = require('morgan');
const { check, validationResult } = require('express-validator'); // validation middleware
const createDOMPurify = require('dompurify'); // npm install dompurify jsdom
const { JSDOM } = require('jsdom');

// init express
const app = new express();
const port = 3001;

app.use(morgan('dev'));
app.use(express.json()); // To automatically decode incoming json

const dao = require('./dao');
const userDao = require('./dao-user');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};

/*** APIs ***/

// GET /api/tickets
app.get('/api/tickets',async (req, res) => {
  try {
    const result = req.query.filter
    ? await dao.listTicketsByCategory(req.query.filter)
    : await dao.listTickets(); 

    if(result.error)
      res.status(404).json(result);
    else
      res.json(result);
  } catch(err) {
    console.error(err);
    res.status(500).end();
  }
});

// GET /api/tickets/generic
app.get('/api/tickets/generic', async (req, res) => {
  try {
    const result = await dao.listTicketsGeneric();
    if(result.error)
      res.status(404).json(result);
    else
      res.json(result);
  } catch(err) {
    res.status(500).end();
  }
});

// GET /api/tickets/<id>
// 422 errore in id, 404 ticket not found, 500 internal database error
app.get('/api/tickets/:id', [ check('id').isInt({min: 1}) ] ,async (req, res) => {

  const errors = validationResult(req).formatWith(errorFormatter); // format error message
  if (!errors.isEmpty()) {
      return res.status(422).json( errors.errors ); // error message is sent back as a json with the error info
  }

  try {
    const result = await dao.getTicket(req.params.id);
    if(result.error)
      res.status(404).json(result); // Ticket not found
    else
      res.json(result);
  } catch(err) {
    res.status(500).end();
  }
});

// GET /api/tickets/<id>/answers
// 422 errore in id, 404 ticket not found, 500 internal database error
app.get('/api/tickets/:id/answers',[ check('id').isInt({min: 1}) ] ,async (req, res) => {

  const errors = validationResult(req).formatWith(errorFormatter); // format error message
  if (!errors.isEmpty()) {
      return res.status(422).json( errors.errors ); // error message is sent back as a json with the error info
  }

  try {
    const ticket = await dao.getTicket(req.params.id);
    if (ticket.error)   // If not found, the function returns a resolved promise with an object where the "error" field is set
      return res.status(404).json(ticket);

    const result = await dao.listAnswersByTicket(req.params.id);
    if(result.error)
      res.status(404).json(result);
    else
      res.json(result);
  } catch(err) {
    res.status(500).end();
  }
});

// GET /api/answers/<id>
// 422 errore in id, 404 answer not found, 500 internal database error
app.get('/api/answers/:id',[ check('id').isInt({min: 1}) ], async (req, res) => {

  const errors = validationResult(req).formatWith(errorFormatter); // format error message
  if (!errors.isEmpty()) {
      return res.status(422).json( errors.errors ); // error message is sent back as a json with the error info
  }

  try {
    const ticket = await dao.getTicket(req.params.id);
    if (ticket.error)   // If not found, the function returns a resolved promise with an object where the "error" field is set
      return res.status(404).json(ticket);
    const result = await dao.getAnswer(req.params.id);
    if(result.error)
      res.status(404).json(result);
    else
      res.json(result);
  } catch(err) {
    res.status(500).end();
  }
});

// POST /api/tickets
// 422 problem with inputs, 405 ownerId doesnt exist, 500 errore server
app.post('/api/tickets', 
  [
    check('ownerId').isInt({min: 1}), // devo controllare anche se esiste
    check('state').isBoolean(),
    // only date (first ten chars) and valid ISO 
    check('timestamp').isLength({min: 10, max: 10}).isISO8601({strict: true}).optional({checkFalsy: true}),
  ],
  async (req, res) => {

  const errors = validationResult(req).formatWith(errorFormatter); // format error message
  if (!errors.isEmpty()) {
      return res.status(422).json( errors.errors ); // error message is sent back as a json with the error info
  }
    const ticket = { 
      state: req.body.state, 
      category: req.body.category, 
      ownerId: req.body.ownerId, // diventerà ownerId: req.user.id
      title: req.body.title, 
      timestamp: req.body.timestamp, 
      description: DOMPurify.sanitize(req.body.description) 
    };

    try {
      const user = await userDao.getUserById(req.body.ownerId); // check if user id exists
      if (user.error)
        return res.status(405).json(user);

      // controllo category??

      const result = await dao.createTicket(ticket);
      res.json(result);
    } catch (err) {
      res.status(503).json({ error: `Database error during the creation of new ticket: ${err}` }); 
    }
  }
);

// POST /api/answers/:id
app.post('/api/answers/:id', async (req, res) => {

  const ticketId = req.params.id; // ticketId
  console.log(ticketId);
  const resultQuestion = await dao.getTicket(ticketId);  // db consistency: make sure ticketId already exists
  if (resultQuestion.error)
    res.status(404).json(resultQuestion);   // ticketId does not exist, please insert the question before the answer
  else {
    const answer = {authorId: req.body.authorId, ticketId: parseInt(req.params.id), timestamp: req.body.timestamp, answer: req.body.answer};
    //console.log('app.post answer: '+JSON.stringify(answer));

    try {
      const newAnswer = await dao.createAnswer(answer);
      res.json(newAnswer);
    } catch (err) {
      res.status(503).json({ error: `Database error during the creation of answer ${answer.answer} by ${answer.authorId}.` });
    }
  }
});

// POST /api/tickets/<id>/editState
app.post('/api/tickets/:id/editState',
  async (req, res) => {

    const ticketId = parseInt(req.params.id);
    // Is the id in the body present? If yes, is it equal to the id in the url?
   /* if (req.body.id && req.body.id !== filmId) {
      return res.status(422).json({ error: 'URL and body id mismatch' });
    } */

    try {
      const ticket = await dao.getTicket(ticketId);
      if (ticket.error)   // If not found, the function returns a resolved promise with an object where the "error" field is set
        return res.status(404).json(ticket);
      ticket.state = req.body.state;  // update state
      console.log(ticket);
      const result = await dao.updateTicket(ticketId, ticket);
      return res.json(result); 
    } catch (err) {
      res.status(503).json({ error: `Database error during the favorite update of ticket ${req.params.id}` });
    }
  }
);


// Activate the server
app.listen(port, () => {
  console.log(`qa-server listening at http://localhost:${port}`);
});