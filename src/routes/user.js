
const express = require('express');
const router = express.Router();

const userController = require('../app/controllers/UserController');
const Authentication = require('../middlewares/authentication');
const AdminAuthentication = require('../middlewares/adminAuthentication');

// USER ONLY
router.get('/me/profile', Authentication, 
    /* 
        #swagger.tags = ['User']
        #swagger.summary = 'Lấy thông tin hồ sơ người dùng'
        #swagger.description = 'Trả về thông tin chi tiết hồ sơ của người dùng hiện tại dựa vào token đăng nhập.'
    */ 
    userController.profile);
router.put('/me/profile', Authentication, 
    /* 
        #swagger.tags = ['User']
        #swagger.summary = 'Cập nhật thông tin hồ sơ người dùng'
        #swagger.description = 'Cho phép người dùng cập nhật thông tin cá nhân như tên, avatar, số điện thoại,...'
    */ 
    userController.updateProfile);
router.patch('/me/change-password', Authentication, 
    /* 
        #swagger.tags = ['User']
        #swagger.summary = 'Đổi mật khẩu người dùng'
        #swagger.description = 'Người dùng có thể thay đổi mật khẩu khi đang đăng nhập. Cần nhập mật khẩu cũ và mật khẩu mới.'
    */ 
   userController.changePassword);
router.get('/me/booking', Authentication, 
    /* 
        #swagger.tags = ['User']
        #swagger.summary = 'Lấy danh sách đặt phòng của người dùng'
        #swagger.description = 'Lấy danh sách tất cả các booking của người dùng theo ID. Chỉ có thể xem thông tin của chính mình.'
        #swagger.security = [{ "cookieAuth": [] }]
    */ 
   userController.getAllBookings);

router.get('/me/coupons', Authentication, 
    /* 
        #swagger.tags = ['User']
        #swagger.summary = 'Lấy danh sách coupon của người dùng'
        #swagger.description = 'Lấy danh sách tất cả các coupon của người dùng theo ID. Chỉ có thể xem thông tin của chính mình.'
        #swagger.security = [{ "cookieAuth": [] }]
    */ 
    userController.getAllCoupons);

router.get('/me/points', Authentication, 
    /* 
        #swagger.tags = ['User']
        #swagger.summary = 'Xem điểm người dùng đã tích luỹ được'
        #swagger.description = 'Xem điểm của người dùng đã kiếm được qua các booking. Chỉ có thể xem thông tin của chính mình.'
        #swagger.security = [{ "cookieAuth": [] }]
    */ 
    userController.checkPoints);

router.get('/me/reviews', Authentication, 
    /* 
        #swagger.tags = ['User']
        #swagger.summary = 'Lấy danh sách reviews của người dùng'
        #swagger.description = 'Lấy danh sách tất cả các reviews của người dùng theo ID. Chỉ có thể xem thông tin của chính mình.'
        #swagger.security = [{ "cookieAuth": [] }]
    */ 
    userController.myReviews);
router.get('/me/notifications', Authentication, 
    /* 
        #swagger.tags = ['User']
        #swagger.summary = 'Lấy danh sách thông báo của người dùng'
        #swagger.description = 'Lấy danh sách tất cả các thông báo của người dùng theo ID. Chỉ có thể xem thông tin của chính mình.'
        #swagger.security = [{ "cookieAuth": [] }]
    */ 
    userController.myNotifications);
// ADMIN ONLY
router.get('', Authentication, AdminAuthentication, 
    /* 
        #swagger.tags = ['User']
        #swagger.summary = 'Lấy danh sách tất cả người dùng (admin)'
        #swagger.description = 'Admin có thể xem danh sách toàn bộ tài khoản người dùng và đối tác trong hệ thống.'
        #swagger.security = [{ "cookieAuth": [] }]
    */ 
   userController.users);
router.get('/pending-owners', Authentication, AdminAuthentication, 
    /* 
        #swagger.tags = ['User']
        #swagger.summary = 'Lấy danh sách đối tác chờ duyệt'
        #swagger.description = 'Admin có thể xem danh sách các chủ khách sạn (owner) đang chờ phê duyệt để kích hoạt tài khoản.'
        #swagger.security = [{ "cookieAuth": [] }]
    */ 
   userController.pendingOwners);
router.delete('/:id', Authentication, AdminAuthentication, 
    /* 
        #swagger.tags = ['User']
        #swagger.summary = 'Xóa tài khoản người dùng (admin)'
        #swagger.description = 'Admin có thể xóa vĩnh viễn một tài khoản khỏi hệ thống bằng ID.'
        #swagger.parameters['id'] = { in: 'path', description: 'ID người dùng cần xóa', required: true, type: 'string' }
    */ 
   userController.deleteAccount);
router.get('/:id', Authentication, AdminAuthentication, 
    /* 
        #swagger.tags = ['User']
        #swagger.summary = 'Xem chi tiết người dùng (admin)'
        #swagger.description = 'Admin có thể xem thông tin chi tiết của một người dùng cụ thể bằng ID.'
        #swagger.parameters['id'] = { in: 'path', description: 'ID người dùng', required: true, type: 'string' }
    */ 
   userController.detailsUser);
router.patch('/:id/approve-owner', Authentication, AdminAuthentication,  
    /* 
        #swagger.tags = ['User']
        #swagger.summary = 'Phê duyệt tài khoản chủ khách sạn'
        #swagger.description = 'Admin phê duyệt tài khoản đăng ký làm chủ khách sạn (owner). Sau khi duyệt, người này có quyền quản lý khách sạn của mình.'
        #swagger.parameters['id'] = { in: 'path', description: 'ID người dùng cần phê duyệt', required: true, type: 'string' }
    */ 
   userController.approveOwner);

module.exports = router;