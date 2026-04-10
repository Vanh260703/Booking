// #swagger.tags = ['Booking']
const express = require('express');
const router = express.Router();

const bookingController = require('../app/controllers/BookingController');

const OptionalAuth = require('../middlewares/optionalAuth');
const Authentication = require('../middlewares/authentication');
const OwnerMiddleware = require('../middlewares/ownerMiddleware');
const AdminAuthentication = require('../middlewares/adminAuthentication');

// PUBLIC & USER
router.post(
    '/',
    OptionalAuth,
    /* 
        #swagger.tags = ['Booking']
        #swagger.summary = 'Khởi tạo booking'
        #swagger.description = 'Tạo mới một đơn đặt phòng. Người dùng chưa đăng nhập vẫn có thể đặt tạm (OptionalAuth).'
    */
    bookingController.createBooking
);
router.get(
    '/',
    Authentication,
    /* 
        #swagger.tags = ['Booking']
        #swagger.summary = 'Lấy danh sách booking của người dùng'
        #swagger.description = 'Trả về tất cả các đơn đặt phòng mà người dùng hiện tại đã tạo.'
    */
    bookingController.myBookings
);
router.get(
    '/:booking',
    Authentication,
    /* 
        #swagger.tags = ['Booking']
        #swagger.summary = 'Chi tiết booking'
        #swagger.description = 'Lấy thông tin chi tiết của một booking cụ thể (theo ID).'
    */
    bookingController.detailsBooking
);
router.put(
    '/:booking/cancel',
    Authentication,
    /* 
        #swagger.tags = ['Booking']
        #swagger.summary = 'Hủy booking'
        #swagger.description = 'Cho phép người dùng đã đăng nhập hủy một đơn đặt phòng còn hiệu lực.'
    */
    bookingController.cancelBooking
);

router.post('/:booking/review', Authentication, 
    /* 
        #swagger.tags = ['Booking']
        #swagger.summary = 'Viết review cho khách sạn'
        #swagger.description = 'Người dùng có thể viết review cho khách sạn sau khi check-out'
    */
    bookingController.createReview);

// OWNER ONLY
router.put(
    '/:booking/confirm',
    Authentication,
    OwnerMiddleware,
    /* 
        #swagger.tags = ['Booking']
        #swagger.summary = 'Chủ khách sạn xác nhận booking'
        #swagger.description = 'Dành cho chủ khách sạn: xác nhận đơn đặt phòng mà khách đã gửi.'
    */
    bookingController.confirmBooking
);
router.patch(
    '/:booking/check-in',
    Authentication,
    OwnerMiddleware,
    /* 
        #swagger.tags = ['Booking']
        #swagger.summary = 'Check-in cho booking'
        #swagger.description = 'Dành cho chủ khách sạn: cập nhật trạng thái booking sang “đã nhận phòng”.'
    */
    bookingController.checkIn
);
router.put(
    '/:booking/check-out',
    Authentication,
    OwnerMiddleware,
    /* 
        #swagger.tags = ['Booking']
        #swagger.summary = 'Check-out cho booking'
        #swagger.description = 'Dành cho chủ khách sạn: cập nhật trạng thái booking sang “đã trả phòng” và đánh dấu booking này có thể đánh giá.'
    */
    bookingController.checkOut
);

router.put(
    '/:booking/cancel-by-owner',
    Authentication,
    OwnerMiddleware,
    /* 
        #swagger.tags = ['Booking']
        #swagger.summary = 'Huỷ booking của người dùng'
        #swagger.description = 'Dành cho chủ khách sạn: Huỷ booking của người dùng
    */
    bookingController.cancelledByOwner
);


module.exports = router;