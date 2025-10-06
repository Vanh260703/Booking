const express = require('express');
require('dotenv').config({ path: __dirname + '/config/.env' });
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const { engine } = require('express-handlebars');
const db = require('./config/database');
const cookieParser = require('cookie-parser');
const route = require('./routes');
const passport = require('./services/passport');

// Kết nối đến database
db.connect();

// middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(passport.initialize());

app.engine(
    'hbs',
    engine({
        extname: '.hbs',
        // helpers: helpers,
        defaultLayout: 'main', // layout mặc định
        layoutsDir: path.join(__dirname, 'resources/views/layouts'),
        partialsDir: [
            path.join(__dirname, 'resources/views/productsViews'),    // nơi chứa product-featured
        ],
    }));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources/views'));

route(app);


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})