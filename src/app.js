const express = require('express');
require('dotenv').config({ path: __dirname + '/config/.env' });
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const db = require('./config/database');
const cookieParser = require('cookie-parser');
const route = require('./routes');

// Kết nối đến database
db.connect();

// middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());

route(app);


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})