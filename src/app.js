const express = require('express');
require('dotenv').config({ path: __dirname + '/config/.env' });
const app = express();
const port = process.env.PORT || 3000;
const db = require('./config/database');

// Kết nối đến database
db.connect();

app.get('/', (req, res) => {
    res.json('HELLO WORLD');
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})