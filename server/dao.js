"use strict";
/* Data Access Object (DAO) */

const sqlite = require('sqlite3');
const dayjs = require('dayjs');

// open the database
const db = new sqlite.Database('ticket.db', (err) => {
  if(err) throw err;
}); 


const convertTicketFromDbRecord = (dbRecord) => {
  const ticket = { 
    id: dbRecord.ticketId, 
    state: dbRecord.state, 
    category: dbRecord.category, 
    ownerId: dbRecord.ownerId, 
    title: dbRecord.title, 
    timestamp: dayjs(dbRecord.timestamp).format("YYYY-MM-DD HH:mm:ss"), 
    description: dbRecord.description,
    username: dbRecord.username
  }; 

  return ticket;
};

const convertAnswerFromDbRecord = (dbRecord) => {
  const answer = {
    answerId: dbRecord.answerId, 
    authorId: dbRecord.authorId,
    ticketId: dbRecord.ticketId, 
    timestamp: dayjs(dbRecord.timestamp).format("YYYY-MM-DD HH:mm:ss"), 
    username: dbRecord.username,
    answer: dbRecord.answer
  };

  return answer;
};

// get all tickets (completed version for logged in users)
exports.listTickets = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT ticketId, state, category, ownerId, title, timestamp, description, Users.username FROM Tickets JOIN Users ON Tickets.ownerId = Users.userId ';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const tickets = rows.map((e) => convertTicketFromDbRecord(e));
      resolve(tickets);
    });
  });
};

// get all tickets (version for generic visitors, no description)
exports.listTicketsGeneric = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT ticketId, state, category, ownerId, title, timestamp, Users.username FROM Tickets JOIN Users ON Tickets.ownerId = Users.userId ';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const tickets = rows.map((e) => ({ id: e.ticketId, state: e.state, category: e.category, ownerId: e.ownerId, title: e.title, timestamp: dayjs(e.timestamp), username: e.username}));
      resolve(tickets);
    });
  });
};

// get the ticket identified by {id}
exports.getTicket = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT ticketId, state, category, ownerId, title, timestamp, description, Users.username FROM Tickets JOIN Users ON Tickets.ownerId = Users.userId WHERE ticketId = ?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row == undefined) {
        resolve({error: 'Ticket not found.'});
      } else {
        resolve(convertTicketFromDbRecord(row));
      }
    });
  });
};

// get all answers to a given ticket
exports.listAnswersByTicket = (ticketId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT answerId, authorId, ticketId, timestamp, answer, Users.username FROM answers JOIN Users ON Answers.authorId = Users.userId WHERE ticketId = ?';

    db.all(sql, [ticketId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const answers = rows.map ((e) => convertAnswerFromDbRecord(e));
      resolve(answers);
    });
  });
};

// get the answer identified by {id}
exports.getAnswer = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT answerId, authorId, ticketId, timestamp, answer, Users.username FROM answers JOIN Users ON Answers.authorId = Users.userId WHERE answerId = ?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row == undefined) {
        resolve({error: 'Answer not found.'});
      } else {
        resolve(convertAnswerFromDbRecord(row)); 
      }
    });
  });
};

// add a new ticket, return the newly created object, re-read from DB
exports.createTicket = (ticket) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO Tickets(state, category, ownerId, title, timestamp, description) VALUES(?, ?, ?, ?, DATETIME(?), ?)';
    db.run(sql, [ticket.state, ticket.category, ticket.ownerId, ticket.title, ticket.timestamp, ticket.description], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(exports.getTicket(this.lastID));
    });
  });
};

// add a new answer, return the newly created object, re-read from DB
exports.createAnswer = (answer) => {
  return new Promise((resolve, reject) => {
    //answer.timestamp = dayjs(answer.timestamp).format('YYYY-MM-DD HH:mm:ss');;
    const sql = 'INSERT INTO Answers(authorId, ticketId, timestamp, answer) VALUES(?, ?, DATETIME(?), ?)';
    db.run(sql, [answer.authorId, answer.ticketId, answer.timestamp, answer.answer], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(exports.getAnswer(this.lastID));
    });
  });
};

// Edit a ticket
exports.updateTicket = (id, ticket) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE Tickets SET state = ?, category = ?, ownerId = ?, title = ?, timestamp = ?, description = ? WHERE ticketId = ?';
    db.run(sql, [ticket.state, ticket.category, ticket.ownerId, ticket.title, ticket.timestamp, ticket.description, id], function (err) {
      if (err) {
        reject(err);
      }
      if (this.changes !== 1) {
        resolve({ error: 'Ticket not found.' });
      } else {
        resolve(exports.getTicket(id)); 
      }
    });
  });
};

exports.listCategories = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM Categories';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const categories = rows.map((row) => row.category);
      resolve(categories);
    });
  });
};


