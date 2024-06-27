'use strict';
/* Data Access Object (DAO) module for accessing users */

const sqlite = require('sqlite3');
const crypto = require('crypto');

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

exports.getUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM Users WHERE email = ?';
    db.get(sql, [email], (err, row) => {
      if (err) { reject(err); }
      else if (row === undefined) { resolve(false); }
      else {
        const user = {userId: row.userId, username: row.username, email: row.email, isAdmin: row.isAdmin};
        
        const salt = row.salt;
        crypto.scrypt(password, salt, 32, (err, hashedPassword) => {
          if (err) reject(err);

          const passwordHex = Buffer.from(row.hash, 'hex');

          if(!crypto.timingSafeEqual(passwordHex, hashedPassword))
            resolve(false);
          else resolve(user); 
        });
      }
    });
  });
};
  