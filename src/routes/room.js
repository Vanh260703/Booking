
const express = require('express');
const router = express.Router();

const roomController = require('../app/controllers/RoomController');

const Authentication = require('../middlewares/authentication');
const OwnerMiddleware = require('../middlewares/ownerMiddleware');
const AdminAuthentication = require('../middlewares/adminAuthentication');

// PUBLIC
router.get('/', 
    /* 
      #swagger.tags = ['Room']
      #swagger.summary = 'Lấy danh sách tất cả các phòng'
      #swagger.description = 'Trả về danh sách toàn bộ các phòng trong hệ thống (có thể giới hạn số lượng hoặc filter theo city, hotel, ...).'
    */
    roomController.getAllRooms);
router.get('/:roomId',  
    /* 
      #swagger.tags = ['Room']
      #swagger.summary = 'Lấy chi tiết phòng'
      #swagger.description = 'Trả về thông tin chi tiết của một phòng bao gồm loại phòng, giá, mô tả, và các tiện ích.'
    */ 
   roomController.detailsRoom);
router.get('/:roomId/availability',  
    /* 
      #swagger.tags = ['Room']
      #swagger.summary = 'Kiểm tra tình trạng phòng'
      #swagger.description = 'Kiểm tra xem phòng có sẵn trong khoảng thời gian mong muốn hay không.'
      #swagger.parameters['checkIn'] = { in: 'query', description: 'Ngày nhận phòng', required: true, type: 'string', example: '2025-12-01' }
      #swagger.parameters['checkOut'] = { in: 'query', description: 'Ngày trả phòng', required: true, type: 'string', example: '2025-12-05' }
    */
    roomController.getAvailability);

// OWNER
router.post('/', Authentication, OwnerMiddleware, 
    /* 
        #swagger.tags = ['Room']
        #swagger.summary = 'Tạo phòng mới cho khách sạn'
        #swagger.description = 'Chỉ chủ khách sạn (owner) có thể tạo phòng mới cho khách sạn của mình.'
    */
    roomController.createRoom);
router.put('/room-types/:roomId', Authentication, OwnerMiddleware, 
    /* 
      #swagger.tags = ['Room']
      #swagger.summary = 'Cập nhật loại phòng'
      #swagger.description = 'Chủ khách sạn có thể chỉnh sửa thông tin loại phòng như giá, mô tả, tiện nghi, ...'
    */
    roomController.updateRoom);
router.delete('/room-types/:roomId', Authentication, OwnerMiddleware, 
    /* 
      #swagger.tags = ['Room']
      #swagger.summary = 'Xóa loại phòng'
      #swagger.description = 'Xóa toàn bộ loại phòng khỏi hệ thống (bao gồm tất cả các phòng con thuộc loại đó).'
    */
    roomController.deleteRoomType);
router.delete('/:roomId', Authentication, OwnerMiddleware, 
    /* 
      #swagger.tags = ['Room']
      #swagger.summary = 'Xóa phòng cụ thể'
      #swagger.description = 'Xóa một phòng đơn lẻ (instance) thuộc loại phòng nào đó.'
    */
    roomController.deleteRoomInstance);
router.patch('/:roomId/status', Authentication, OwnerMiddleware, 
    /* 
        #swagger.tags = ['Room']
        #swagger.summary = 'Cập nhật trạng thái phòng'
        #swagger.description = 'Thay đổi trạng thái phòng (ví dụ: available, maintenance, out_of_service, ...).'
    */ 
    roomController.updateRoomStatus);
router.patch('/:roomId/pricing', Authentication, OwnerMiddleware, 
    /* 
        #swagger.tags = ['Room']
        #swagger.summary = 'Cập nhật giá phòng'
        #swagger.description = 'Thay đổi giá phòng theo ngày hoặc theo loại.'
    */ 
    roomController.updateRoomPricing);
router.get('/:roomId/bookings', Authentication, OwnerMiddleware, 
    /* 
      #swagger.tags = ['Room']
      #swagger.summary = 'Xem danh sách booking của phòng'
      #swagger.description = 'Chủ khách sạn có thể xem toàn bộ danh sách đặt phòng cho một phòng cụ thể.'
    */
    roomController.getRoomBookings);

module.exports = router;