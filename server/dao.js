"use strict";
/* Data Access Object (DAO) */

const sqlite = require('sqlite3');
const dayjs = require('dayjs');

// open the database
const db = new sqlite.Database('ticket.db', (err) => {
  if(err) throw err;
}); 

// get all tickets
exports.listTickets = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT ticketId, state, category, ownerId, title, timestamp, description FROM Tickets';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const tickets = rows.map((e) => ({ id: e.ticketId, state: e.state, category: e.category, ownerId: e.ownerId, title: e.title, timestamp: dayjs(e.timestamp), description: e.description}));
      resolve(tickets);
    });
  });
};

// get tickets filtering by category
exports.listTicketsByCategory = (category) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT ticketId, state, category, ownerId, title, timestamp, description FROM Tickets WHERE category = ?';
    db.all(sql, [category], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const tickets = rows.map((e) => ({ id: e.ticketId, state: e.state, category: e.category, ownerId: e.ownerId, title: e.title, timestamp: dayjs(e.timestamp), description: e.description}));
      resolve(tickets);
    });
  });
};

// get tickets filtering by state
exports.listTicketsByState = (state) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT ticketId, state, category, ownerId, title, timestamp, description FROM Tickets WHERE state = ?';
    db.all(sql, [state], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const tickets = rows.map((e) => ({ id: e.ticketId, state: e.state, category: e.category, ownerId: e.ownerId, title: e.title, timestamp: dayjs(e.timestamp), description: e.description}));
      resolve(tickets);
    });
  });
};

// get the ticket identified by {id}
exports.getTicket = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT ticketId, state, category, ownerId, title, timestamp, description FROM Tickets WHERE ticketId = ?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row == undefined) {
        resolve({error: 'Ticket not found.'});
      } else {
        
        const ticket = { 
          id: row.ticketId, 
          state: row.state, 
          category: row.category, 
          ownerId: row.ownerId, 
          title: row.title, 
          timestamp: dayjs(row.timestamp), 
          description: row.description 
        };        
        resolve(ticket);
      }
    });
  });
};

// get all answers
exports.listAnswers = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT answerId, authorId, ticketId, timestamp, answer FROM answers';

    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      const answers = rows.map((e) => ({answerId: e.answerId, authorId: e.authorId, ticketId: e.ticketId, timestamp: dayjs(e.timestamp), answer: e.answer}));
      resolve(answers);
    });
  });
};

// get all answers to a given ticket
exports.listAnswersByTicket = (ticketId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT answerId, authorId, ticketId, timestamp, answer FROM answers WHERE ticketId = ?';

    db.all(sql, [ticketId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      const answers = rows.map((e) => ({answerId: e.answerId, authorId: e.authorId, ticketId: e.ticketId, timestamp: dayjs(e.timestamp), answer: e.answer}));
      resolve(answers);
    });
  });
};

// get the answer identified by {id}
exports.getAnswer = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT answerId, authorId, ticketId, timestamp, answer FROM answers WHERE answerId = ?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row == undefined) {
        resolve({error: 'Answer not found.'});
      } else {
        
        const answer = {answerId: row.answerId, authorId: row.authorId, ticketId: row.ticketId, timestamp: dayjs(row.timestamp), answer: row.answer};
        resolve(answer);
      }
    });
  });
};

