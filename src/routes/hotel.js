
const express = require('express');
const router = express.Router();

const hotelController = require('../app/controllers/HotelController');

const Authentication = require('../middlewares/authentication');
const OwnerMiddleware = require('../middlewares/ownerMiddleware');
const AdminAuthentication = require('../middlewares/adminAuthentication');

// =================== PUBLIC ===================
router.get(
    '/recommended',
    /* 
        #swagger.tags = ['Hotel']
        #swagger.summary = 'Lấy danh sách khách sạn được đề xuất'
        #swagger.description = 'Trả về danh sách khách sạn được hệ thống gợi ý dựa trên mức độ phổ biến, đánh giá, hoặc vị trí.'
    */
    hotelController.recommendHotel
);
router.get(
    '/featured',
    /* 
        #swagger.tags = ['Hotel']
        #swagger.summary = 'Lấy danh sách khách sạn nổi bật'
        #swagger.description = 'Lấy các khách sạn được đánh dấu là nổi bật để hiển thị trên trang chủ.'
    */
    hotelController.featuredHotels
);
router.get(
    '/:city',
    /* 
        #swagger.tags = ['Hotel']
        #swagger.summary = 'Lấy danh sách khách sạn theo thành phố'
        #swagger.description = 'Trả về danh sách tất cả khách sạn thuộc một thành phố cụ thể.'
    */
    hotelController.hotels
);
router.get(
    '/:hotelId',
    /* 
        #swagger.tags = ['Hotel']
        #swagger.summary = 'Lấy thông tin chi tiết của khách sạn'
        #swagger.description = 'Trả về chi tiết khách sạn bao gồm thông tin, tiện nghi, hình ảnh và đánh giá.'
    */
    hotelController.detailsHotel
);
router.get(
    '/:hotelId/rooms',
    /* 
        #swagger.tags = ['Hotel']
        #swagger.summary = 'Lấy danh sách phòng của khách sạn'
        #swagger.description = 'Trả về tất cả các loại phòng thuộc về một khách sạn cụ thể, bao gồm giá, số lượng và tình trạng phòng.'
    */
    hotelController.getRoomsByHotel
);

// =================== OWNER ===================
router.get(
    '/:hotelId/bookings',
    Authentication,
    OwnerMiddleware,
    /* 
        #swagger.tags = ['Hotel']
        #swagger.summary = 'Lấy tất cả booking của khách sạn (Owner)'
        #swagger.description = 'Dành cho chủ khách sạn: xem danh sách toàn bộ đơn đặt phòng trong khách sạn của mình.'
    */
    hotelController.getAllBookingsInHotel
);
router.post(
    '/',
    Authentication,
    OwnerMiddleware,
    /* 
        #swagger.tags = ['Hotel']
        #swagger.summary = 'Tạo mới khách sạn (Owner)'
        #swagger.description = 'Dành cho chủ khách sạn: thêm mới một khách sạn vào hệ thống.'
    */
    hotelController.createHotel
);
router.put(
    '/:hotelId',
    Authentication,
    OwnerMiddleware,
    /* 
        #swagger.tags = ['Hotel']
        #swagger.summary = 'Cập nhật thông tin khách sạn (Owner)'
        #swagger.description = 'Dành cho chủ khách sạn: cập nhật thông tin, mô tả, hoặc hình ảnh khách sạn của mình.'
    */
    hotelController.updateHotel
);

// =================== ADMIN ===================
router.get(
    '/',
    Authentication,
    AdminAuthentication,
    /* 
        #swagger.tags = ['Hotel']
        #swagger.summary = 'Lấy danh sách tất cả khách sạn (Admin)'
        #swagger.description = 'Dành cho admin: xem danh sách toàn bộ khách sạn trong hệ thống.'
    */
    hotelController.getAllHotels
);
router.patch(
    '/:hotelId/approve',
    Authentication,
    AdminAuthentication,
    /* 
        #swagger.tags = ['Hotel']
        #swagger.summary = 'Phê duyệt khách sạn (Admin)'
        #swagger.description = 'Dành cho admin: phê duyệt khách sạn do đối tác gửi lên để được hiển thị công khai.'
    */
    hotelController.approveHotel
);
router.patch(
    '/:hotelId/reject',
    Authentication,
    AdminAuthentication,
    /* 
        #swagger.tags = ['Hotel']
        #swagger.summary = 'Từ chối phê duyệt khách sạn (Admin)'
        #swagger.description = 'Dành cho admin: từ chối yêu cầu phê duyệt khách sạn, kèm lý do nếu có.'
    */
    hotelController.rejectHotel
);

module.exports = router;