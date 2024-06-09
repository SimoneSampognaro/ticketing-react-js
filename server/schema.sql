-- Create Ticket table
CREATE TABLE Ticket (
    ticketId INTEGER PRIMARY KEY AUTOINCREMENT,
    state BOOLEAN,
    category TEXT,
    owner TEXT REFERENCES User(username),
    ownerId INTEGER REFERENCES User(userId),
    title TEXT,
    timestamp DATETIME,
    description TEXT,
    answerId INTEGER,
    FOREIGN KEY (answerId) REFERENCES Answer(answer_id)
);


-- Create User table
CREATE TABLE User (
    userId INTEGER PRIMARY KEY,
    username TEXT,
    email TEXT,
    password TEXT
);

-- Create Answer table
CREATE TABLE Answer (
    answerId INTEGER PRIMARY KEY AUTOINCREMENT,
    
    authorId INTEGER,
    answer TEXT,
    FOREIGN KEY (ticket_id) REFERENCES Ticket(ticket_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);
