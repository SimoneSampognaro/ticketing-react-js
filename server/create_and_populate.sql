BEGIN TRANSACTION;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS Answers;
DROP TABLE IF EXISTS Tickets;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Categories;

-- Create User table
CREATE TABLE IF NOT EXISTS Users (
    userId INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    isAdmin BOOLEAN,
    password TEXT NOT NULL
);

-- Create Categories table
CREATE TABLE IF NOT EXISTS Categories (
    category TEXT PRIMARY KEY
);

-- Create Ticket table
CREATE TABLE IF NOT EXISTS Tickets (
    ticketId INTEGER PRIMARY KEY AUTOINCREMENT,
    state BOOLEAN, 
    category TEXT,
    ownerId INTEGER, -- Owner of the ticket
    title TEXT,
    timestamp DATETIME,
    description TEXT NOT NULL,
    FOREIGN KEY (ownerId) REFERENCES Users(userId),
    FOREIGN KEY (category) REFERENCES Categories(category)
);

-- Create Answer table
CREATE TABLE IF NOT EXISTS Answers (
    answerId INTEGER PRIMARY KEY AUTOINCREMENT,
    authorId INTEGER, -- Author of the answer
    ticketId INTEGER,
    timestamp DATETIME,
    answer TEXT NOT NULL,
    FOREIGN KEY (authorId) REFERENCES Users(userId),
    FOREIGN KEY (ticketId) REFERENCES Tickets(ticketId)
);

-- Insert data into User table
INSERT INTO Users (username, email, isAdmin, password) VALUES ('user1', 'user1@example.com', 1, 'password1');
INSERT INTO Users (username, email, isAdmin, password) VALUES ('user2', 'user2@example.com', 0, 'password2');
INSERT INTO Users (username, email, isAdmin, password) VALUES ('user3', 'user3@example.com', 0, 'password3');

-- Insert data into Categories table
INSERT INTO Categories(category) VALUES('inquiry');
INSERT INTO Categories(category) VALUES('maintenance');
INSERT INTO Categories(category) VALUES('new feature');
INSERT INTO Categories(category) VALUES('administrative');
INSERT INTO Categories(category) VALUES('payment');

-- Insert data into Ticket table
INSERT INTO Tickets (state, category, ownerId, title, timestamp, description) 
VALUES (1, 'inquiry', 1, 'Issue with login', '2024-06-05 08:00:00', 'User cannot login with correct credentials');
INSERT INTO Tickets (state, category, ownerId, title, timestamp, description) 
VALUES (0, 'new feature', 2, 'Add dark mode', '2024-06-05 09:00:00', 'User requests dark mode feature');
INSERT INTO Tickets (state, category, ownerId, title, timestamp, description) 
VALUES (1, 'maintenance', 1, 'Add dark mode', '2024-06-08 10:00:00', 'User requests dark mode feature');
INSERT INTO Tickets (state, category, ownerId, title, timestamp, description) 
VALUES (0, 'administrative', 3, 'Add dark mode', '2024-06-01 17:30:00', 'User requests dark mode feature');
INSERT INTO Tickets (state, category, ownerId, title, timestamp, description) 
VALUES (1, 'payment', 3, 'Add dark mode', '2024-06-02 08:30:00', 'User requests dark mode feature');

-- Insert data into Answer table
INSERT INTO Answers (authorId, ticketId, timestamp, answer) 
VALUES (3, 1, '2024-06-05 08:30:00', 'We are looking into this issue');
INSERT INTO Answers (authorId, ticketId, timestamp, answer) 
VALUES (1, 2, '2024-06-05 09:30:00', 'Dark mode will be added in the next release');

COMMIT;