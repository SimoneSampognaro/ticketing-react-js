"use strict";

import dayjs from "dayjs";

const URL = 'http://localhost:3001/api';
const estimation_URL = 'http://localhost:3002/api';

async function getAllTickets() {
  // Call  GET /api/tickets -- Logged-in users
  const response = await fetch(URL+'/tickets',
    {
      credentials: 'include'
    }
  );
  const tickets = await response.json();
  if (response.ok) {
    return tickets.map((e) => ({ id: e.id, state: e.state, category: e.category, ownerId: e.ownerId, title: e.title, timestamp: dayjs(e.timestamp), description: e.description, username: e.username}));
  } else {
    throw tickets;  // expected to be a json object (coming from the server) with info about the error
  }
}

async function getAllTicketsGeneric() {
  // Call GET /api/tickets/generic  -- Generic visitors
  const response = await fetch(URL+'/tickets/generic');
  const tickets = await response.json();
  if (response.ok) {
    return tickets.map((e) => ({ id: e.id, state: e.state, category: e.category, title: e.title, timestamp: dayjs(e.timestamp), username: e.username}));
  } else {
    throw tickets;  // expected to be a json object (coming from the server) with info about the error
  }
}

async function getAllCategories(){
  // Call GET /api/categories
  const response = await fetch(URL+`/categories`,
    {
      credentials: 'include'
    }
  );
  const categories = await response.json();
  if (response.ok) {
    return categories;
  } else {
    throw categories;  // expected to be a json object (coming from the server) with info about the error
  }
}

async function getAllAnswersForTicket(id) {
    // Call GET /api/tickets/:id/answers
    const response = await fetch(URL+`/tickets/${id}/answers`,
      {
        credentials: 'include'
      }
    );
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
    // Call  POST /api/tickets
    return new Promise((resolve, reject) => {
      fetch(URL+`/tickets`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticket),
      }).then((response) => {
        if (response.ok) {
          response.json()
            .then((id) => resolve(id))
            .catch(() => { reject({ error: "Cannot parse server response." }) });
        } else {
          // analyze the cause of error
          response.json()
            .then((message) => { reject(message); }) // error message in the response body
            .catch(() => { reject({ error: "Cannot parse server response." }) });
        }
      }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
    });
}

function addAnswer(answer,ticketId) {
  // Call  POST /api/answers/:ticketId
  return new Promise((resolve, reject) => {
    fetch(URL+`/answers/${ticketId}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(answer),
    }).then((response) => {
      if (response.ok) {
        response.json()
          .then((id) => resolve(id))
          .catch(() => { reject({ error: "Cannot parse server response." }) });
      } else {
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) });
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

function editTicket(ticket) {
  // Call  PUT /api/tickets/<id>/edit
  return new Promise((resolve, reject) => {
    fetch(URL+`/tickets/${ticket.id}/edit`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ category: ticket.category, state: ticket.state }),
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

function closeTicket(ticket){
  // Call  PUT /api/tickets/<id>/closeTicket
  return new Promise((resolve, reject) => {
    fetch(URL+`/tickets/${ticket.id}/closeTicket`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      //body: JSON.stringify({ state: 0 }),
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) });
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

/*** Authentication functions ***/
async function logIn(credentials) {
  let response = await fetch(URL + '/sessions', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errDetail = await response.json();
    throw errDetail.message;
  }
}

async function logOut() {
  await fetch(URL+'/sessions/current', {
    method: 'DELETE', 
    credentials: 'include' 
  });
}

async function getUserInfo() {
  const response = await fetch(URL+'/sessions/current', {
    credentials: 'include'
  });
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;  // an object with the error coming from the server
  }
}

async function getAuthToken() {
  // Call GET /api/auth-token
  const response = await fetch(URL+'/auth-token', {
    credentials: 'include'
  });
  const token = await response.json();
  if (response.ok) {
    return token;
  } else {
    throw token;  // an object with the error coming from the server
  }
}

async function getEstimations(authToken, tickets) {
  // Call POST /api/estimations -- Second Server

  // Ask the estimation only for open tickets
  const openTickets = tickets.filter(ticket => ticket.state === 1);

  const payload = openTickets.map(ticket => ({
    category: ticket.category,
    title: ticket.title,
    id: ticket.id
  }));

  const response = await fetch(estimation_URL + `/estimations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const info = await response.json();

  if (response.ok) {
    return info; //  Array with id and estimations
  } else {
    throw info; // Expected to be a json object (coming from the server) with info about the error
  }
}


const API = {
    getAllTickets, getAllAnswersForTicket, addTicket, getAllCategories, addAnswer, 
    editTicket, closeTicket, logIn, logOut, getUserInfo, getAllTicketsGeneric, getAuthToken, getEstimations
};
export default API;