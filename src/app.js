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
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger-output.json');
const cros = require('cors');
const { checkInRemind } = require('./services/startCrons');
const { initMinioBucket } = require('./services/minioService');

// Kết nối đến database
db.connect();

// middlewares
app.use(cros({
    origin: 'http://localhost:5500',
    credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(passport.initialize());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Chạy crons
checkInRemind();

// Khởi tạo MinIO
initMinioBucket();

app.engine(
    'hbs',
    engine({
        extname: '.hbs',
        // helpers: helpers,
        defaultLayout: 'main', // layout mặc định
    }));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources/views'));

route(app);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
  console.log(`Swagger is running on http://localhost:${port}/docs`)
})