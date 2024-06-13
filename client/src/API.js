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

const API = {
    getAllTickets, getAllAnswersForTicket
};
export default API;