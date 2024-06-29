'use strict';

// git add . ; git commit -m "title" ; git push

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
const expireTime = 10; //seconds

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
app.get('/api/tickets', isLoggedIn, async (req, res) => {
  try {
  
  const result = await dao.listTickets(); 
  if(result.error)
      res.status(404).json(result);
  else           // sort by time backend side
      res.json(result.sort((a, b) => dayjs(b.timestamp).diff(dayjs(a.timestamp))));
  } catch(err) {
    console.error(err);
    res.status(500).end();
  }
});

// GET /api/categories
app.get('/api/categories',
  (req, res) => {
    dao.listCategories()
      .then(categories => res.json(categories))
      .catch((err) => res.status(500).json(err)); // always return a json and an error message
  }
);

// GET /api/tickets/generic
app.get('/api/tickets/generic', async (req, res) => {
  try {
    const result = await dao.listTicketsGeneric();
    if(result.error)
      res.status(404).json(result);
    else
      res.json(result.sort((a, b) => dayjs(b.timestamp).diff(dayjs(a.timestamp))));
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
    else{
      res.json(result);
    }  
  } catch(err) {
    res.status(500).end();
  }
});

// GET /api/tickets/<id>/answers
// 422 errore in id, 500 internal database error, 404 wrong id
app.get('/api/tickets/:id/answers', [check('id').isInt({min: 1})] , async (req, res) => {

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

// GET /api/answers/<id>
// 422 errore in id, 404 answer not found, 500 internal database error
app.get('/api/answers/:id', [ check('id').isInt({min: 1}) ] , async (req, res) => {

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
// 422 problem with inputs, 500 errore server, 406 categories doesnt exist (ritorna le categories possibili!)
app.post('/api/tickets', isLoggedIn,
  [
    check('category').notEmpty().isString(),
    check('title').notEmpty().isString(), // lets check also that text fields dont contain only white spaces
    check('description').notEmpty().isString(),
  ],
  async (req, res) => {

     // timestamp, owner, state set HERE (for now i set ownerId=1, then i will retrieve from req.user.id)

  const errors = validationResult(req).formatWith(errorFormatter); // format error message
  if (!errors.isEmpty()) {
      return res.status(422).json( errors.errors ); // error message is sent back as a json with the error info
  }

    if(req.body.title.trim().length == 0 || req.body.description.trim().length == 0){ // category viene già controllata perchè deve appartenere alla tabella
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
// 422 errore in id, 404 ticketId not found, 500 internal database error, 406 ticket chiuso
app.post('/api/answers/:id', isLoggedIn,
  [
  check('id').isInt({min: 1}),
  check('answer').notEmpty().isString(),
   ],
   async (req, res) => {
    
    // timestamp and authorId set by backend

    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
        return res.status(422).json( errors.errors ); // error message is sent back as a json with the error info
    }

    if(req.body.answer.trim().length == 0){
      return res.status(422).json({error: "Empty text field are not allowed!"}); 
   }

    const answer = {authorId: req.user.userId,         
      ticketId: parseInt(req.params.id),
      timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss"), 
      answer: req.body.answer
    };
    
    try {
 
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
// Chiamata da admin o proprietari del ticket, controllo che lo stato mandato sia CHIUSO
app.put('/api/tickets/:id/closeTicket', isLoggedIn,
  [
  check('id').isInt({min: 1}),
  check('state').isBoolean().custom(value => value === 0)
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
      if(!ticket.state){
        return res.status(422).json({error: "Ticket is closed!" });
      }

      //const user = await userDao.getUserById(req.user.userId);
      if(!req.user.isAdmin && req.user.userId != ticket.ownerId ) // non sei admin e non sei proprietario
        return res.status(401).json({error: "Not authorized"});
      
      ticket.state = req.body.state;  // user is admin or the owner
      const result = await dao.updateTicket(ticketId, ticket);
      return res.json(result); 
    } catch (err) {
      res.status(503).json({ error: `Database error during the state update of ticket ${req.params.id}` });
    }
  }
);

// PUT /api/tickets/<id>/editCategory
// 404 ticket not found, 503 database error, 422 errore in input
/*app.put('/api/tickets/:id/editCategory',[
  check('id').isInt({min: 1}),
  check('category').notEmpty().isString() // ridondante
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
); */

// PUT /api/tickets/<id>/edit
// 404 ticket not found, 503 database error, 422 errore in input
// SUPPONGO CHE QUI CI VADANO SOLO ADMIN
app.put('/api/tickets/:id/edit', isLoggedIn,
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
        const categories = await dao.listCategories(); // check if category exists
        if (!(categories.includes(req.body.category)))
        return res.status(422).json(categories);
      }

      const ticket = await dao.getTicket(ticketId);
      if (ticket.error)   // If not found, the function returns a resolved promise with an object where the "error" field is set
        return res.status(404).json(ticket);

      //const user = await userDao.getUserById(req.user.userId);
      if(!req.user.isAdmin){ // non sei admin
        return res.status(401).json({error: "Not authorized"});
      } 
      ticket.state = req.body.state;
      ticket.category = req.body.category;
      const result = await dao.updateTicket(ticketId, ticket);
      return res.json(result);
    } catch (err) {
      res.status(503).json({ error: `Database error during the state update of ticket ${req.params.id}` });
    } // { error: `Database error during the favorite update of ticket ${req.params.id}` }
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

// ALTERNATIVE: if we are not interested in sending error messages...
/*
app.post('/api/sessions', passport.authenticate('local'), (req,res) => {
  // If this function gets called, authentication was successful.
  // `req.user` contains the authenticated user.
  res.json(req.user);
});
*/

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
    res.status(401).json({error: 'Not authenticated'});
});

/*** Token ***/

// GET /api/auth-token
app.get('/api/auth-token', isLoggedIn, (req, res) => {
  let authLevel = req.user.isAdmin ? "admin" : "normal";
  const payloadToSign = { access: authLevel, authId: 1234 };
  const jwtToken = jsonwebtoken.sign(payloadToSign, jwtSecret, {expiresIn: expireTime});

  res.json({token: jwtToken, authLevel: authLevel});  // authLevel is just for debug. Anyway it is in the JWT payload
});


/*** Start Server ***/
app.listen(port, () => {
  console.log(`ticket-server listening at http://localhost:${port}`);
});


// *************************** TO BE REMOVED ****************************************

// POST /api/tickets
// 422 problem with inputs, 405 ownerId doesnt exist (ritorna "error": "User not found."), 500 errore server, 406 categories doesnt exist (ritorna le categories possibili!)
app.post('/api/ticketst', 
  [
    check('ownerId').isInt({min: 1}), // devo controllare anche se esiste
    check('state').isBoolean(),
    check('category').notEmpty().isString(),
    check('title').notEmpty().isString(), // lets check also that text fields dont contain only white spaces
    check('description').notEmpty().isString(),
    check('timestamp').isLength({min: 19, max: 19}).isISO8601({strict: true}),
  ],
  async (req, res) => {

     // check('timestamp').isLength({min: 16, max: 16}).isISO8601({strict: true}),
     // check('timestamp').isDate({format: 'YYYY-MM-DD HH:mm:ss', strictMode: true})
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

    console.log(ticket.timestamp);
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
app.post('/api/answersS/:id', [
  check('id').isInt({min: 1}),
  check('authorId').isInt({min: 1}),
  check('answer').notEmpty().isString(), 
  check('timestamp').isLength({min: 16, max: 16}).isISO8601({strict: true}),
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