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
    
    let result = {};
    if(req.query.filter){ // if defined
      const categories = await dao.listCategories(); // check if category exists
      if (!(categories.includes(req.query.filter)))
        return res.status(406).json(categories);

      result = await dao.listTicketsByCategory(req.query.filter);
    }
    else{
      result = await dao.listTickets(); 
    }
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
// 422 errore in id, 500 internal database error, 404 wrong id
app.get('/api/tickets/:id/answers',[ check('id').isInt({min: 1}) ] ,async (req, res) => {

  const errors = validationResult(req).formatWith(errorFormatter); // format error message
  if (!errors.isEmpty()) {
      return res.status(422).json( errors.errors ); // error message is sent back as a json with the error info
  }

  try {
    const ticket = await dao.getTicket(req.params.id);
    if (ticket.error)   // If not found, the function returns a resolved promise with an object where the "error" field is set
      return res.status(404).json(ticket); 

    const result = await dao.listAnswersByTicket(req.params.id); // se id non esistesse, semplicemente tornebbe un array vuoto, come se non esistessero risposte, in realtà non esiste id
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
// 422 problem with inputs, 405 ownerId doesnt exist (ritorna "error": "User not found."), 500 errore server, 406 categories doesnt exist (ritorna le categories possibili!)
app.post('/api/tickets', 
  [
    check('ownerId').isInt({min: 1}), // devo controllare anche se esiste
    check('state').isBoolean(),
    check('category').notEmpty(),
    check('title').notEmpty(), // lets check also that text fields dont contain only white spaces
    check('description').notEmpty().isString(),
    check('timestamp').isLength({min: 16, max: 16}).isISO8601({strict: true}),
  ],
  async (req, res) => {

  const errors = validationResult(req).formatWith(errorFormatter); // format error message
  if (!errors.isEmpty()) {
      return res.status(422).json( errors.errors ); // error message is sent back as a json with the error info
  }

    if(req.body.title.trim().length ==0 || DOMPurify.sanitize(req.body.description, {ALLOWED_TAGS: ['b','i']}).length ==0 ){ // category viene già controllata perchè deve appartenere alla tabella
       return res.status(422).json({error: "Empty text field are not allowed!"});  // description check after sanitize perchè magari l'utente potrebbe avere inserito anche soltanto <script>
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

      const categories = await dao.listCategories(); // check if category exists
      if (!(categories.includes(req.body.category)))
        return res.status(406).json(categories);

      const result = await dao.createTicket(ticket);
      res.json(result);
    } catch (err) {
      res.status(503).json({ error: `Database error during the creation of new ticket: ${err}` }); 
    }
  }
);

// POST /api/answers/:id
// 422 errore in id, 404 ticketId not found, 500 internal database error, 405 authorId non esiste, 406 ticket chiuso
app.post('/api/answers/:id', [
  check('id').isInt({min: 1}),
  check('authorId').isInt({min: 1}),
  check('answer').notEmpty(),
  check('timestamp').isLength({min: 16, max: 16}).isISO8601({strict: true}).optional({checkFalsy: true}),
   ],
   async (req, res) => {

    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
        return res.status(422).json( errors.errors ); // error message is sent back as a json with the error info
    }

    const answer = {authorId: req.body.authorId, ticketId: parseInt(req.params.id), timestamp: req.body.timestamp, answer: req.body.answer};
    //console.log('app.post answer: '+JSON.stringify(answer));
    try {
      const user = await userDao.getUserById(req.body.authorId); // check if user id exists
      if (user.error)
        return res.status(405).json({error: "User not found"});

      const ticketId = req.params.id; // ticketId
      const resultTicket = await dao.getTicket(ticketId);  // db consistency: make sure ticketId already exists
      if (resultTicket.error)
        return res.status(404).json({error: "Ticket not found"});   // ticketId does not exist, please insert the question before the answer
      if(!resultTicket.state) // ticket chiuso, non è ammesso risponder
        return res.status(406).json({error: "Ticket is closed"});
      const newAnswer = await dao.createAnswer(answer);
      res.json(newAnswer);
    } catch (err) {
      res.status(503).json({ error: `Database error during the creation of answer ${answer.answer} by ${answer.authorId}.` });
    }
  }
);

// PUT /api/tickets/<id>/editState
// 404 ticket not found, 503 database error, 422 errore in input
app.put('/api/tickets/:id/editState',[
  check('id').isInt({min: 1}),
  check('state').isBoolean()
 ],
  async (req, res) => {

    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
        return res.status(422).json( errors.errors ); // error message is sent back as a json with the error info
    }

    const ticketId = parseInt(req.params.id);

    try {
      const ticket = await dao.getTicket(ticketId);
      if (ticket.error)   // If not found, the function returns a resolved promise with an object where the "error" field is set
        return res.status(404).json(ticket);
      ticket.state = req.body.state;  // update state
      const result = await dao.updateTicket(ticketId, ticket);
      return res.json(result); 
    } catch (err) {
      res.status(503).json({ error: `Database error during the state update of ticket ${req.params.id}` });
    } // { error: `Database error during the favorite update of ticket ${req.params.id}` }
  }
);

// PUT /api/tickets/<id>/editCategory
// 404 ticket not found, 503 database error, 422 errore in input
app.put('/api/tickets/:id/editCategory',[
  check('id').isInt({min: 1}),
  check('category').notEmpty()
 ],
  async (req, res) => {

    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
        return res.status(422).json( errors.errors ); // error message is sent back as a json with the error info
    }

    const ticketId = parseInt(req.params.id);

    try {
      const categories = await dao.listCategories(); // check if category exists
      if (!(categories.includes(req.body.category)))
        return res.status(406).json(categories);

      const ticket = await dao.getTicket(ticketId);
      if (ticket.error)   // If not found, the function returns a resolved promise with an object where the "error" field is set
        return res.status(404).json(ticket);

      ticket.category = req.body.category;  // update state
      const result = await dao.updateTicket(ticketId, ticket);
      return res.json(result); 
    } catch (err) {
      res.status(503).json({ error: `Database error during the state update of ticket ${req.params.id}` });
    } // { error: `Database error during the favorite update of ticket ${req.params.id}` }
  }
);


// Activate the server
app.listen(port, () => {
  console.log(`qa-server listening at http://localhost:${port}`);
});