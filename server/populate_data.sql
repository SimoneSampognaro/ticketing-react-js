-- Insert data into User table
INSERT INTO Users (username, email, password) VALUES ('user1', 'user1@example.com', 'password1');
INSERT INTO Users (username, email, password) VALUES ('user2', 'user2@example.com', 'password2');
INSERT INTO Users (username, email, password) VALUES ('user3', 'user3@example.com', 'password3');

-- Insert data into Ticket table
INSERT INTO Tickets (state, category, ownerId, title, timestamp, description) 
VALUES (1, 'inquiry', 1, 'Issue with login','09-06-2024' ,'User cannot login with correct credentials');
INSERT INTO Tickets (state, category, ownerId, title, timestamp, description) 
VALUES (0, 'new feature', 2, 'Add dark mode','05-06-2024' ,'User requests dark mode feature');
INSERT INTO Tickets (state, category, ownerId, title, timestamp, description) 
VALUES (1, 'maintenance', 1, 'Add dark mode','08-06-2024' ,'User requests dark mode feature');
INSERT INTO Tickets (state, category, ownerId, title, timestamp, description) 
VALUES (0, 'administrative', 3, 'Add dark mode','08-06-2024' ,'User requests dark mode feature');
INSERT INTO Tickets (state, category, ownerId, title, timestamp, description) 
VALUES (1, 'payment', 3, 'Add dark mode','07-06-2024' ,'User requests dark mode feature');

-- Insert data into Answer table
INSERT INTO Answers (authorId, ticketId,timestamp, answer) 
VALUES (3, 1,'09-06-2024' ,'We are looking into this issue');
INSERT INTO Answers (authorId, ticketId,timestamp, answer) 
VALUES (1, 2, '08-06-2024' ,'Dark mode will be added in the next release');
