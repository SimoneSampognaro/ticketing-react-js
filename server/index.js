'use strict';

// git add . ; git commit -m "title" ; git push

const express = require('express');
const morgan = require('morgan');

// init express
const app = new express();
const port = 3001;

app.use(morgan('dev'));
app.use(express.json()); // To automatically decode incoming json

const dao = require('./dao');
const userDao = require('./dao-user');

/*** APIs ***/

// GET /api/tickets
app.get('/api/tickets', async (req, res) => {
  try {
    const result = await dao.listTickets();
    if(result.error)
      res.status(404).json(result);
    else
      res.json(result);
  } catch(err) {
    res.status(500).end();
  }
});

// GET /api/tickets/<id>
app.get('/api/tickets/:id', async (req, res) => {
  try {
    const result = await dao.getTicket(req.params.id);
    if(result.error)
      res.status(404).json(result);
    else
      res.json(result);
  } catch(err) {
    res.status(500).end();
  }
});

// GET /api/tickets/<id>/answers
app.get('/api/tickets/:id/answers', async (req, res) => {
  try {
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
app.get('/api/answers/:id', async (req, res) => {
  try {
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
app.post('/api/tickets', 
  async (req, res) => {

    const ticket = { 
      id: req.body.ticketId, 
      state: req.body.state, 
      category: req.body.category, 
      ownerId: req.body.ownerId, // diventerà ownerId: req.user.id
      title: req.body.title, 
      timestamp: req.body.timestamp, 
      description: req.body.description 
    };

    try {
      const result = await dao.createTicket(ticket); // NOTE: createFilm returns the newly created object
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


// ------------ Test for queries ----------------
/* dao.listTickets()
  .then(tickets => {
    tickets.forEach(ticket => {
      console.log(ticket.description);
    });
  })
  .catch(err => {
    console.error('Error:', err);
  });

  dao.listAnswers()
  .then(tickets => {
    tickets.forEach(answer => {
      console.log(answer.answer);
    });
  })
  .catch(err => {
    console.error('Error:', err);
  }); */
//dao.getTicket(10).then(e => console.log(e));
//userDao.getUserById(1).then(e => console.log(e)).catch(err => console.err(err));
//dao.listAnswers().then(e => console.log(e));
//dao.listAnswersByTicket(1).then(e => {console.log(e);}).catch(err => {
//  console.error('Error:', err.message);});

/*dao.listTicketsByState(false)
  .then(tickets => {
    tickets.forEach(ticket => {
      console.log(ticket.id);
    });
  })
  .catch(err => {
    console.error('Error:', err);
  });

  dao.listTicketsByCategory("new feature")
  .then(tickets => {
    tickets.forEach(ticket => {
      console.log(ticket.category);
    });
  })
  .catch(err => {
    console.error('Error:', err);
  }); */


