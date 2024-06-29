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
    hash TEXT NOT NULL,
    salt TEXT NOT NULL
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

-- Populate Users table
INSERT INTO Users (username, email, isAdmin, hash, salt) VALUES
('user1', 'user1@example.com', 0, '15d3c4fca80fa608dcedeb65ac10eff78d20c88800d016369a3d2963742ea288','72e4eeb14def3b21'),
('user2', 'user2@example.com', 0, '1d22239e62539d26ccdb1d114c0f27d8870f70d622f35de0ae2ad651840ee58a','a8b618c717683608'),
('admin1', 'admin1@example.com', 1, '61ed132df8733b14ae5210457df8f95b987a7d4b8cdf3daf2b5541679e7a0622','e818f0647b4e1fe0'),
('user3', 'user3@example.com', 0, '0d559b5e8dd346241a56e1c317a4a6b9857cd4d959717902f6f50ef106ac6c06', 'a648f0647b4e1fe0'),
('admin2', 'admin2@example.com', 1, '96a0ecbb732733495c48d2ca3ee942eb48f1d28845648641e40f33498d8ca16f', '76h8f06477ui1as1');

-- Populate Categories table
INSERT INTO Categories (category) VALUES
('inquiry'),
('maintenance'),
('new feature'),
('administrative'),
('payment');

-- Populate Tickets table
INSERT INTO Tickets (state, category, ownerId, title, timestamp, description) VALUES
(1, 'inquiry', 1, 'Inquiry about product features', '2024-06-29 10:00:00', 'Can you provide details about the features of this product?\nThank you.'),
(0, 'maintenance', 1, 'Maintenance request for server', '2024-06-28 10:00:00', 'The server is down, and we need maintenance to get it back up.\nPlease assist.'),
(1, 'new feature', 3, 'Request for a new reporting feature', '2024-06-29 11:00:00', 'Can we add a new feature for generating monthly reports?\nThis would be very helpful.'),
(0, 'administrative', 3, 'Change of account administrator', '2024-06-28 11:00:00', 'Please change the administrator for our account to John Doe.\nThank you.'),
(1, 'payment', 5, 'Issue with payment processing', '2024-06-29 12:00:00', 'There is an issue with processing payments through our portal.\nWe need this resolved urgently.'),
(0, 'inquiry', 5, 'Inquiry about pricing plans', '2024-06-28 12:00:00', 'Can you explain the different pricing plans available?\nKind regards.');

-- Populate Answers table
INSERT INTO Answers (authorId, ticketId, timestamp, answer) VALUES
(2, 3, '2024-06-29 12:30:00', 'We are considering adding this feature in the next update.\nStay tuned for updates.'),
(4, 4, '2024-06-28 12:30:00', 'The change has been made.\nJohn Doe is now the account administrator.'),
(1, 5, '2024-06-29 13:00:00', 'We are looking into the payment issue.\nWe will resolve it soon.'),
(3, 6, '2024-06-28 13:00:00', 'Here are the details of the different pricing plans we offer:\n1. Basic\n2. Standard\n3. Premium.');

COMMIT;
