const authRouter = require('./auth');
const userRouter = require('./user');
const hotelRouter = require('./hotel');
const cityRouter = require('./city');
const searchRouter = require('./search');
const roomRouter = require('./room');
const bookingRouter = require('./booking');
const paymentRouter = require('./payment');
const couponRouter = require('./coupon');
const reviewRouter = require('./review');
const notificationRouter = require('./notification');
const uploadRouter = require('./upload');
const dashboardRouter = require('./dashboard');

function route (app) {
    // routes/auth.js
    app.use('/api/auth', authRouter);

    // routes/user.js
    app.use('/api/users', userRouter);

    // routes/city.js
    app.use('/api/cities', cityRouter);

    // routes/hotel.js
    app.use('/api/hotels', hotelRouter);

    // routes/search.js
    app.use('/api/search', searchRouter); 

    // routes/room.js
    app.use('/api/rooms', roomRouter);

    // routes/booking.js
    app.use('/api/bookings', bookingRouter);

    // routes/payment.js
    app.use('/api/payments', paymentRouter);

    // routes/coupon.js
    app.use('/api/coupons',  couponRouter);

    // routes/review.js
    app.use('/api/reviews', reviewRouter);

    // routes/notification.js
    app.use('/api/notifications', notificationRouter);

    // routes/upload.js
    app.use('/api/upload', uploadRouter);

    // routes/dashboard.js
    app.use('/api/dashboard', dashboardRouter);
}

module.exports = route;
