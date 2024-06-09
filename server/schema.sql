-- Create User table
CREATE TABLE Users (
    userId INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    email TEXT,
    password TEXT
);

-- Create Ticket table
CREATE TABLE Tickets (
    ticketId INTEGER PRIMARY KEY AUTOINCREMENT,
    state BOOLEAN,
    category TEXT,
    ownerId INTEGER REFERENCES User(userId), -- Owner of the ticket
    title TEXT,
    timestamp TEXT,
    description TEXT
);

-- Create Answer table
CREATE TABLE Answers (
    answerId INTEGER PRIMARY KEY AUTOINCREMENT,
    authorId INTEGER REFERENCES User(userId), -- Author of the answer
    ticketId INTEGER,
    timestamp TEXT,
    answer TEXT,
    FOREIGN KEY (ticketId) REFERENCES Ticket(ticketId)
);