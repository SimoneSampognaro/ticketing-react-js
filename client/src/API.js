"use strict";

import dayjs from "dayjs";

const URL = 'http://localhost:3001/api';
const estimation_URL = 'http://localhost:3002/api';

async function getAllTickets() {
  // call  /api/tickets
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
  // call  /api/tickets
  const response = await fetch(URL+'/tickets/generic');
  const tickets = await response.json();
  if (response.ok) {
    return tickets.map((e) => ({ id: e.id, state: e.state, category: e.category, title: e.title, timestamp: dayjs(e.timestamp), username: e.username}));
  } else {
    throw tickets;  // expected to be a json object (coming from the server) with info about the error
  }
}

async function getTicketById(id) {
  // call  /api/ticket/:id
  const response = await fetch(URL+`/tickets/${id}`,
    {
      credentials: 'include'
    }
  );
  const ticket = await response.json();
  if (response.ok) {
    const e = ticket;
    return {id: e.id, state: e.state, category: e.category, ownerId: e.ownerId, title: e.title, timestamp: dayjs(e.timestamp), description: e.description, username: e.username};
  } else {
    throw ticket;  // expected to be a json object (coming from the server) with info about the error
  }
}

async function getAllCategories(){
  // call  /api/questions
  const response = await fetch(URL+'/categories');
  const categories = await response.json();
  if (response.ok) {
    return categories;
  } else {
    throw categories;  // expected to be a json object (coming from the server) with info about the error
  }
}

async function getAllAnswersForTicket(id) {
    // call  /api/tickets/:id/answers
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
    // call  POST /api/tickets
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

function addAnswer(answer,ticketId) {
  // call  POST /api/answers/:ticketId
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

function editTicket(ticket) {
  // call  PUT /api/tickets/<id>/edit
  return new Promise((resolve, reject) => {
    fetch(URL+`/tickets/${ticket.id}/edit`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticket),
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

function closeTicket(ticket){// call  PUT /api/tickets/<id>/closeTicket
  return new Promise((resolve, reject) => {
    fetch(URL+`/tickets/${ticket.id}/closeTicket`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Object.assign({}, ticket, {state: 0})),
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
  const response = await fetch(URL+'/auth-token', {
    credentials: 'include'
  });
  const token = await response.json();
  console.log("ei");
  if (response.ok) {
    return token;
  } else {
    throw token;  // an object with the error coming from the server
  }
}

async function getEstimation(authToken, ticket) {
  // retrieve info from an external server, where info can be accessible only via JWT token
  const response = await fetch(estimation_URL+`/estimationTime`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ticket),
  });
  const info = await response.json();
  if (response.ok) {
    return info;
  } else {
    throw info;  // expected to be a json object (coming from the server) with info about the error
  }
}

const API = {
    getAllTickets, getAllAnswersForTicket, addTicket, getAllCategories, addAnswer, getTicketById, 
    editTicket, closeTicket, logIn, logOut, getUserInfo, getAllTicketsGeneric, getAuthToken, getEstimation
};
export default API;