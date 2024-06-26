'use strict';
/* Data Access Object (DAO) module for accessing users */

const sqlite = require('sqlite3');

// open the database
const db = new sqlite.Database('ticket.db', (err) => {
  if(err) throw err;
});

// get the user identified by {id}
exports.getUserById = (id) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT username, email, isAdmin FROM Users WHERE UserId = ?';
      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        if (row == undefined) {
          resolve({error: 'User not found.'});
        } else {
          const user = { userId: id, username: row.username, email: row.email, isAdmin: row.isAdmin};
          resolve(user);
        }
      });
    });
};
  