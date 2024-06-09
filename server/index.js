'use strict';

// git add . ; git commit -m "title" ; git push

/* const express = require('express');

// init express
const app = new express();
const port = 3001;

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
}); */

const dao = require('./dao');
const userDao = require('./dao-user');


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

