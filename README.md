[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/Y8bW3OQP)
# Exam #1: "Ticketing system"
## Student: s322918 SAMPOGNARO SIMONE 

## React Client Application Routes

- Route `/`: Home page, shows the list of all tickets. Authenticated users see a list of all the tickets in the same form as the generic visitors, plus some buttons to perform operations.
- Route `/add`: Page to submit a ticket by entering title, category and description, a confirmation page will appear providing also the estimation.
- Route `/edit/:ticketId`: Page for admins to edit the category and the state of the ticket identified by :ticketId.
- Route `/login`: Login form, allows users to login. After a successful login, the user is redirected to the main route ("/").
- Route `*`: Page for nonexisting URLs (Not Found page) that redirects to the home page.

```plaintext
prova
```

## API Server

- GET `/api/tickets`: Get all tickets (including description for logged-in users)
  - ***response body***: JSON object with the list of tickets
  ```plaintext
  {id: 5, state: 1, category: "payment", ownerId: 5, title: "Issue with payment processing", timestamp:"2024-06-29 12:00:00", username:"admin2", description:"There is an issue with processing payments through our portal.\\nWe need this resolved urgently."}
  ```
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
  - Codes: `200 OK` , `404 Not found`, `500 Internal Server Error`, `422 Unprocessable Entity` (the requested action can not be performed)
- POST `/api/tickets`: Create a new ticket
  - ***request***: JSON object with the category, title and description inserted by the user
  ```plaintext
  {category: "new feature", title: "Multi-factor authentication", description: "Security by design is important!\\nWe want strong authentication"}
  ```
  - ***response body***: JSON object with the new ticket id and timestamp on success, otherwise a JSON object with error description
  ```plaintext
  {id: 10, timestamp: "2024-06-29 13:00:00"}
  ```
  - Codes: `200 OK` , `404 Not found`, `500 Internal Server Error`, `422 Unprocessable Entity` (the requested action can not be performed)
- POST `/api/answers/:id`: Submit an answer for the ticket identified by `:id`
  - ***request***: JSON object with the new answer text 
  ```plaintext
  {answer: "We are working on it.\nStay tuned."}
  ```
  - ***response body***: JSON object with the new answer id and timestamp on success, otherwise a JSON object with error description
  ```plaintext
  {id: 7, timestamp: "2024-06-30 12:18:40"}
  ```
  - Codes: `200 OK` , `404 Not found`, `500 Internal Server Error`, `422 Unprocessable Entity` (the requested action can not be performed), `406 Not acceptable` Ticket closed
- PUT `/api/tickets/<id>/closeTicket`: Close the ticket identified by `:id`
  - ***response body***: JSON object with the edited ticket id and timestamp on success, otherwise a JSON object with error description
  ```plaintext
  {id: 10, timestamp: "2024-06-29 13:00:00"}
  ```
  - Codes: `200 OK` , `404 Not found`, `500 Internal Server Error`, `422 Unprocessable Entity` (the requested action can not be performed), `406 Not acceptable` Ticket closed
- PUT `/api/tickets/:id/editTicket`: Admin users can open, close or modify ticket identified by `:id`
  - ***request***: JSON object contains the category and state values to update the ticket
  ```plaintext
  { category: "payment", state: 1}
  ```
  - ***response body***: JSON object with the edited ticket id and timestamp on success, otherwise a JSON object with error description
  ```plaintext
  {id: 10, timestamp: "2024-06-29 13:00:00"}
  ```
  - Codes: `200 OK` , `404 Not found`, `500 Internal Server Error`, `422 Unprocessable Entity` (the requested action can not be performed)
  
- GET `/api/auth-token` Authenticated users fetch the token whose _authLevel_ depends on the user role (admin or normal)
  - ***response body***: JSON object with token
  ```plaintext
  {authLevel: "admin", token :"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJhZG1pbiIsImF1dGhJZCI6MTIzNCwiaWF0IjoxNzE5NzQ0MDA0LCJleHAiOjE3MTk3NDQxMjR9.zb7eVXkTCSABfxm_-mceZXVRqieflpNCiS0Q_RtAnYg"}
  ```
  - ***Token payload***:
  ```plaintext
  { access: "admin", userId: 3};
  ```
  - Codes: `200 OK` , `401 Not authorized`


### Authentication APIs

- POST `/api/login`: Authenticate and login the user.
  - **Request**: JSON object with _username_ equal to email:   
    ```
    { "username": "admin1@example.com", "password": "pwd" }
    ```
  - **Response body**: JSON object with the user's info
    ```
    {userId: 3, username: "admin1", email: "admin1@example.com", isAdmin: 1}
    ```
  - Codes: `200 OK`, `401 Unauthorized` (incorrect email and/or password), `400 Bad Request` (invalid request body), `500 Internal Server Error`.


- DELETE `/api/session`: Logout the user.
  - Codes: `200 OK`, `401 Unauthorized`.

- GET `/api/current-user`: Get info on the logged in user.
  - Codes: `200 OK`, `401 Unauthorized`, `500 Internal Server Error`.
  - **Response body**: JSON object with the same info as in login:   
    ```
    {userId: 3, username: "admin1", email: "admin1@example.com", isAdmin: 1}
    ```


## API Server2

- POST `/api/estimations` : Returns the estimation for the requested open tickets for admin users
  - **Request Headers**: JWT token with _access_ flag  
  - **Request**: JSON object with a list of objects containing for each ticket: category, title and ticketId
    ```
    [{ category: "payment", title: "Satispay" , id: 1 }]
    ```
  - **Response body**: JSON object with id and estimation for each ticket requested
    ```
    [{id: 1, estimation: 240}]
    ```
  - Codes: `200 OK`, `401 Unauthorized`, `422 Unprocessable Entity` (invalid request body).


## Database Tables

- Table `Tickets` - (ticketId), state, category, ownerId, title, timestamp, description
- Table `Answers` - (answerId), ticketId, authorId, timestamp, answer
- Table `Users` - (userId), username, email, isAdmin, hash, salt

## Main React Components

- `AppWithRouter` (in `App.jsx`): Essentially a component that acts as the main App, wrapped inside a `Router` to leverage the useNavigate hook. This component is responsible for managing the majority of the application's state.
- `MyTicketList` (in `MyTicket.jsx`): Renders the list of all tickets.
- `MyTicket` (in `MyTicket.jsx`): Displays detailed ticket information. If the user is authenticated, additional components are rendered: `ButtonGroup` for closing and editing tickets, `MyAnswerList` for displaying answers, and `MyAnswerForm` for submitting new answers.
- `MyAnswer` (in `MyAnswer.jsx`): Renders answer details within a `Card` Bootstrap component.
- `MyTicketForm` (in `MyTicketForm.jsx`): Facilitates ticket creation. Upon clicking the Add button, a confirmation dialog is displayed in the `MyModal` component after retrieving an estimate from the server
- `MyTicketEdit` (in `MyTicketEdit.jsx`): Provides ticket editing functionality for administrators. Displays ticket data, a `ToggleButton` to change the ticket status, and a `Form.Select` to choose categories fetched from the server.
- `MyHeader` (in `MyHeader.jsx`): The navigation bar of the application, where API errors are displayed also.
- `LoginForm` (in LoginForm.jsx): The login form for user authentication. Responsible for client-side validation of login credentials, ensuring a valid email and a non-empty password.

## Screenshot

![Screenshot](./img/admin.png)
![Screenshot](./img/form.png)
![Screenshot](./img/confirmation.png)

## Users Credentials

- user1@example.com, password : "pwd"
- user2@example.com, password : "pwd"
- user3@example.com, password : "pwd"
- admin1@example.com, password : "pwd"
- admin2@example.com, password : "pwd"

