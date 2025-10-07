const authRouter = require('./auth');
const userRouter = require('./user');
const hotelRouter = require('./hotel');
// const roomRouter = require('./room');
// const bookingRouter = require('./booking');
// const paymentRouter = require('./payment');
// const reviewRouter = require('./review');
// const couponRouter = require('./coupon');
// const notificationRouter = require('./notification');
// const dashboardRouter = require('./dashboad');
// const uploadRouter = require('./upload');

function route (app) {
    // routes/auth.js
    app.use('/api/auth', authRouter);

    // routes/user.js
    app.use('/api/users', userRouter);

    // // routes/hotel.js
    app.use('/api/hotels', hotelRouter);

    // // routes/room.js
    // app.use('/api/room', roomRouter);

    // // routes/booking.js
    // app.use('/api/booking', bookingRouter);

    // // routes/payment.js
    // app.use('/api/payment', paymentRouter);

    // // routes/review.js
    // app.use('/api/review', reviewRouter);

    // // routes/coupon.js
    // app.use('/api/coupon', couponRouter);

    // // routes/notification.js
    // app.use('/api/notification', notificationRouter);

    // // routes/dashboard.js
    // app.use('/api/dashboard', dashboardRouter);

    // // routes/upload.js
    // app.use('/api/upload', uploadRouter);
}

module.exports = route;