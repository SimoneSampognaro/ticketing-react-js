"use strict";

import dayjs from "dayjs";

const URL = 'http://localhost:3001/api';

async function getAllTickets() {
  // call  /api/questions
  const response = await fetch(URL+'/tickets');
  const tickets = await response.json();
  if (response.ok) {
    return tickets.map((e) => ({ id: e.id, state: e.state, category: e.category, ownerId: e.ownerId, title: e.title, timestamp: dayjs(e.timestamp), description: e.description, username: e.username}));
  } else {
    throw tickets;  // expected to be a json object (coming from the server) with info about the error
  }
}

async function getAllCategories(){
  // call  /api/questions
  const response = await fetch(URL+'/categories');
  const categories = await response.json();
  if (response.ok) {
    return categories;
  } else {
    throw tickets;  // expected to be a json object (coming from the server) with info about the error
  }
}

async function getAllAnswersForTicket(id) {
    // call  /api/questions
    const response = await fetch(URL+`/tickets/${id}/answers`);
    const answers = await response.json();
    if (response.ok) {
      return answers.map((e) => ({answerId: e.answerId, 
        authorId: e.authorId, 
        ticketId: e.ticketId, 
        timestamp: dayjs(e.timestamp),
        username: e.username,
        answer: e.answer}));
    } else {
      throw answers;  // expected to be a json object (coming from the server) with info about the error
    }
  }

  function addTicket(ticket) {
    // call  POST /api/tickets
    return new Promise((resolve, reject) => {
      fetch(URL+`/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.assign({}, ticket, {timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss')})),
      }).then((response) => {
        if (response.ok) {
          response.json()
            .then((id) => resolve(id))
            .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
        } else {
          // analyze the cause of error
          response.json()
            .then((message) => { reject(message); }) // error message in the response body
            .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
        }
      }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
    });
  }

const API = {
    getAllTickets, getAllAnswersForTicket, addTicket, getAllCategories
};
export default API;