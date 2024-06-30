## API Server

- GET `/api/tickets`: Get all tickets (including description for logged-in users)
  - ***response body***: JSON object with the list of tickets
  ```plaintext
  {id: 5, state: 1, category: "payment", ownerId: 5, title: "Issue with payment processing", timestamp:"2024-06-29 12:00:00", username:"admin2", description:"There is an issue with processing payments through our portal.\\nWe need this resolved urgently."}
  ```
  - Codes: `200 OK` , `404 Not found`, `500 Internal Server Error`, `401 Not authorized`.
- GET `/api/categories`: Get all categories 
  - ***response body***: JSON object with the list of categories
  ```plaintext
  ["inquiry", "maintenance", "new feature", "administrative", "payment"]
  ```
  - Codes: `200 OK` , `401 Not authorized`, `500 Internal Server Error`.
- GET `/api/tickets/generic`: Get all tickets (not including description for generic visitors)
  - ***response body***: JSON object with the list of tickets
  ```plaintext
  {id: 5, state: 1, category: "payment", ownerId: 5, title: "Issue with payment processing", timestamp:"2024-06-29 12:00:00", username:"admin2"}
  ```
  - Codes: `200 OK` , `404 Not found`, `500 Internal Server Error`.
- GET `/api/tickets/:id/answers`: Get all answers for the ticket identified by `:id`
  - ***response body***: JSON object with the list of answers
  ```plaintext
  {answerId: 4, authorId: 1, ticketId: 5, timestamp: "2024-06-29 13:00:00", username: "user1", answer:"We are looking into the payment issue.\\nWe will resolve it soon."}
  ```
  - Codes: `200 OK` , `404 Not found`, `500 Internal Server Error`, `422 Unprocessable Entity` (the requested action can not be performed), `401 Not authorized`.
- POST `/api/tickets`: Create a new ticket
  - ***request***: JSON object with the category, title and description inserted by the user
  ```plaintext
  {category: "new feature", title: "Multi-factor authentication", description: "Security by design is important!\\nWe want strong authentication"}
  ```
  - ***response body***: JSON object with the new ticket id and timestamp on success, otherwise a JSON object with error description
  ```plaintext
  {id: 10, timestamp: "2024-06-29 13:00:00"}
  ```
  - Codes: `200 OK` , `404 Not found`, `500 Internal Server Error`, `422 Unprocessable Entity` (the requested action can not be performed), `401 Not authorized`.
- POST `/api/answers/:id`: Submit an answer for the ticket identified by `:id`
  - ***request***: JSON object with the new answer text 
  ```plaintext
  {answer: "We are working on it.\nStay tuned."}
  ```
  - ***response body***: JSON object with the new answer id and timestamp on success, otherwise a JSON object with error description
  ```plaintext
  {id: 7, timestamp: "2024-06-30 12:18:40"}
  ```
  - Codes: `200 OK` , `404 Not found`, `500 Internal Server Error`, `422 Unprocessable Entity` (the requested action can not be performed), `406 Not acceptable` Ticket closed, `401 Not authorized`.
- PUT `/api/tickets/<id>/closeTicket`: Close the ticket identified by `:id`
  - ***response body***: JSON object with the edited ticket id and timestamp on success, otherwise a JSON object with error description
  ```plaintext
  {id: 10, timestamp: "2024-06-29 13:00:00"}
  ```
  - Codes: `200 OK` , `404 Not found`, `500 Internal Server Error`, `422 Unprocessable Entity` (the requested action can not be performed), `406 Not acceptable` Ticket closed, `401 Not authorized`.
- PUT `/api/tickets/:id/editTicket`: Admin users can open, close or modify ticket identified by `:id`
  - ***request***: JSON object contains the category and state values to update the ticket
  ```plaintext
  { category: "payment", state: 1}
  ```
  - ***response body***: JSON object with the edited ticket id and timestamp on success, otherwise a JSON object with error description
  ```plaintext
  {id: 10, timestamp: "2024-06-29 13:00:00"}
  ```
  - Codes: `200 OK` , `404 Not found`, `500 Internal Server Error`, `422 Unprocessable Entity` (the requested action can not be performed), `401 Not authorized`.
  
- GET `/api/auth-token` Authenticated users fetch the token whose _authLevel_ depends on the user role (admin or normal)
  - ***response body***: JSON object with token
  - ***Token payload***: access flag and userId
  ```plaintext
  { access: "admin", userId: 3};
  ```
  - Codes: `200 OK` , `401 Not authorized`.
