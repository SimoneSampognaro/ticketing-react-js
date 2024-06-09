'use strict';

// git add . ; git commit -m "title" ; git push

const express = require('express');

// init express
const app = new express();
const port = 3001;

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

