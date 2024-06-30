'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dayjs = require('dayjs');
const { check, validationResult } = require('express-validator'); // validation middleware

const passport = require('passport'); // auth middleware

//const LocalStrategy = require('passport-local').Strategy; // username and password for login
const LocalStrategy = require('passport-local'); // username and password for login
const session = require('express-session'); // enable sessions

const jsonwebtoken = require('jsonwebtoken');
const jwtSecret = '6xvL4xkAAbG49hcXf5GIYSvkDICiUAR6EdR5dLdwW7hMzUjjMUe9t6M5kSAYxsvX';
const expireTime = 240; //seconds

// init express
const app = new express();
const port = 3001;

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

app.use(morgan('dev'));
app.use(express.json()); // To automatically decode incoming json

const dao = require('./dao');
const userDao = require('./dao-user');

const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function(username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username or password.' });
        
      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize only the user id and store it in the session
passport.serializeUser((user, done) => {
  done(null, user.userId, user.username, user.isAdmin);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated())
    return next();
  
  return res.status(401).json({ error: 'Not authenticated'});
}

// set up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: 'wge8d239bwd93rkskb',   // change this random string, should be a secret value
  resave: false,
  saveUninitialized: false
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());

/*** APIs ***/

// GET /api/tickets
// Users logged-in
// `401 Not authorized`, 500 internal database error
app.get('/api/tickets', isLoggedIn, async (req, res) => {
  try {
  
  const result = await dao.listTickets(); 
  // sort by time backend side
  res.json(result.sort((a, b) => dayjs(b.timestamp).diff(dayjs(a.timestamp))));
  } catch(err) {
    res.status(500).end();
  }
});

// GET /api/categories
// `401 Not authorized`, 500 internal database error
app.get('/api/categories', isLoggedIn,
  (req, res) => {
    dao.listCategories()
      .then(categories => res.json(categories))
      .catch((err) => res.status(500).json(err));
  }
);

// GET /api/tickets/generic
// Generic visitors
// 500 internal database error
app.get('/api/tickets/generic', async (req, res) => {
  try {
    const result = await dao.listTicketsGeneric();
    // sort by time backend side
    res.json(result.sort((a, b) => dayjs(b.timestamp).diff(dayjs(a.timestamp))));
  } catch(err) {
    res.status(500).end();
  }
});

// GET /api/tickets/<id>/answers
// 422 errore in id, 500 internal database error, 404 wrong id, `401 Not authorized`
app.get('/api/tickets/:id/answers', isLoggedIn, [check('id').isInt({min: 1})] , async (req, res) => {

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
    else     // sorty by decreasing date
      res.json(result.sort((a, b) => dayjs(a.timestamp).diff(dayjs(b.timestamp))));
  } catch(err) {
    res.status(500).end();
  }
});

// POST /api/tickets
// 422 problem with inputs, 500 error server, 422 categories doesnt exist, `401 Not authorized`
app.post('/api/tickets', isLoggedIn,
  [
    check('category').notEmpty().isString(),
    check('title').notEmpty().isString(), // lets check also that text fields dont contain only white spaces
    check('description').notEmpty().isString(),
  ],
  async (req, res) => {

  const errors = validationResult(req).formatWith(errorFormatter); // format error message
  if (!errors.isEmpty()) {
      return res.status(422).json( errors.errors ); // error message is sent back as a json with the error info
  }

    if(req.body.title.trim().length == 0 || req.body.description.trim().length == 0){
       return res.status(422).json({error: "Empty text field are not allowed!"}); 
    }

    const ticket = { 
      state: 1,            
      category: req.body.category, 
      ownerId: req.user.userId,
      title: req.body.title, 
      timestamp:  dayjs().format("YYYY-MM-DD HH:mm:ss"), 
      description: req.body.description,
      username: req.user.username
    };

    try {

      const categories = await dao.listCategories(); // check if category exists in the DB
      if (!(categories.includes(req.body.category)))
        return res.status(422).json(categories);

      const result = await dao.createTicket(ticket);
      res.json({ id: result.id, timestamp: result.timestamp });
    } catch (err) {
      res.status(500).json({ error: `Database error during the creation of new ticket: ${err}` }); 
    }
  }
);

// POST /api/answers/:id
// 422 error in id, 404 ticketId not found, 500 internal database error, 406 ticket chiuso, `401 Not authorized`
app.post('/api/answers/:id', isLoggedIn,
  [
  check('id').isInt({min: 1}),
  check('answer').notEmpty().isString(),
   ],
   async (req, res) => {

    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
        return res.status(422).json( errors.errors ); // error message is sent back as a json with the error info
    }

    if(req.body.answer.trim().length == 0){
      return res.status(422).json({error: "Empty text field are not allowed!"}); 
   }

    const answer = {
      authorId: req.user.userId,         
      ticketId: parseInt(req.params.id),
      timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss"), 
      answer: req.body.answer
    };
    
    try {
 
      const ticketId = req.params.id;
      const resultTicket = await dao.getTicket(ticketId);  // db consistency: make sure ticketId already exists
      if (resultTicket.error)
        return res.status(404).json({error: "Ticket not found"});   // ticketId does not exist
      if(!resultTicket.state) 
        return res.status(406).json({error: "Ticket is closed"}); // Ticket is closed, no answers can be provided
      const newAnswer = await dao.createAnswer(answer);
      res.json({ id: newAnswer.answerId, timestamp: newAnswer.timestamp });
    } catch (err) {
      res.status(500).json({ error: `Database error during the creation of answer ${answer.answer} by ${answer.authorId}.` });
    }
  }
);

// PUT /api/tickets/<id>/closeTicket
// 404 ticket not found, 500 database error, 422 errore in input, 401 Not authorized
// Only admins or ticket's owner will be able to perform the operation, if the ticket is open
app.put('/api/tickets/:id/closeTicket', isLoggedIn,
  [
  check('id').isInt({min: 1}),
 ],
  async (req, res) => {

    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
        return res.status(422).json( errors.errors ); // error message is sent back as a json with the error info
    }

    const ticketId = parseInt(req.params.id);

    try {
      const ticket = await dao.getTicket(ticketId);
      if (ticket.error)   
        return res.status(404).json(ticket); // Ticket not found
      if(!ticket.state){
        return res.status(422).json({error: "Ticket is closed!" }); // Ticket is already closed
      }

      if(!req.user.isAdmin && req.user.userId != ticket.ownerId ) 
        return res.status(401).json({error: "Not authorized"}); // User is neither an admin nor the owner of a ticket
      
      ticket.state = 0;  // User is admin or the owner
      const result = await dao.updateTicket(ticketId, ticket);
      return res.json({ id: result.id, timestamp: result.timestamp }); 
    } catch (err) {
      res.status(500).json({ error: `Database error during the state update of ticket ${req.params.id}` });
    }
  }
);

// PUT /api/tickets/<id>/editTicket
// 404 ticket not found, 500 database error, 422 errore in input
// Only admins will be able to perform the operation
app.put('/api/tickets/:id/editTicket', isLoggedIn,
  [
  check('id').isInt({min: 1}),
  check('state').isBoolean(),
  check('category').notEmpty().isString()
 ],
  async (req, res) => {

    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
        return res.status(422).json( errors.errors ); // error message is sent back as a json with the error info
    }

    const ticketId = parseInt(req.params.id);

    try {
      if(req.body.category){
        const categories = await dao.listCategories(); // check if category exists in the DB
        if (!(categories.includes(req.body.category)))
        return res.status(422).json(categories);
      }

      const ticket = await dao.getTicket(ticketId);
      if (ticket.error)   
        return res.status(404).json(ticket); // Ticket not found


      if(!req.user.isAdmin){
        return res.status(401).json({error: "Not authorized"}); // User is not an admin
      } 
      ticket.state = req.body.state;
      ticket.category = req.body.category;
      const result = await dao.updateTicket(ticketId, ticket);
      return res.json({ id: result.id, timestamp: result.timestamp });
    } catch (err) {
      res.status(500).json({ error: `Database error during the state update of ticket ${req.params.id}` });
    }
  }
);

/*** Users APIs ***/

// POST /sessions 
// login
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).json(info);
      }
      // success, perform the login
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        // req.user contains the authenticated user, we send all the user info back
        // this is coming from userDao.getUser()
        return res.json(req.user);
      });
  })(req, res, next);
});

// DELETE /sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout( ()=> { res.end(); } );
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Unauthenticated user!'});
});

/*** Token ***/

// GET /api/auth-token
app.get('/api/auth-token', isLoggedIn, (req, res) => {
  let authLevel = req.user.isAdmin ? "admin" : "normal";

  const payloadToSign = { access: authLevel, userId: req.user.userId };
  const jwtToken = jsonwebtoken.sign(payloadToSign, jwtSecret, {expiresIn: expireTime});

  res.json({token: jwtToken, authLevel: authLevel});
});


/*** Start Server ***/
app.listen(port, () => {
  console.log(`ticket-server listening at http://localhost:${port}`);
});