const express = require('express');
const router = express.Router();

const Authentication = require('../middlewares/authentication');
const OwnerMiddleware = require('../middlewares/ownerMiddleware');
const AdminAuthentication = require('../middlewares/adminAuthentication');

const notificationController = require('../app/controllers/NotificationController');

// USER
router.patch('/:id/read', Authentication, 
    /* 
        #swagger.tags = ['Notification']
        #swagger.summary = 'Đánh dấu đã đọc thông báo'
        #swagger.description = 'Cho phép người dùng đánh dấu thông báo là đã đọc'
        #swagger.parameters['id'] = { in: path, description: 'ID thông báo cần đánh dấu', reuired: true, type: 'string'}
    */
    notificationController.markAsRead);
router.patch('/read-all', Authentication, 
    /* 
        #swagger.tags = ['Notification']
        #swagger.summary = 'Đánh dấu đã đọc tất cả thông báo'
        #swagger.description = 'Cho phép người dùng đánh dấu tất cả thông báo là đã đọc'
    */
    notificationController.markAllAsRead);
router.delete('/:id', Authentication, 
    /* 
        #swagger.tags = ['Notification']
        #swagger.summary = 'Xoá thông báo'
        #swagger.description = 'Cho phép người dùng xoá thông báo'
        #swagger.parameters['id'] = { in: path, description: 'ID thông báo cần xoá', reuired: true, type: 'string'}
    */
    notificationController.deleteNotification);
router.delete('/', Authentication, 
    /* 
        #swagger.tags = ['Notification']
        #swagger.summary = 'Xoá tất cả thông báo'
        #swagger.description = 'Cho phép người dùng xoá tất cả thông báo'
    */
    notificationController.deleteAllNotification);

// ADMIN ONLY
router.post('/send', Authentication, AdminAuthentication, 
    /* 
        #swagger.tags = ['Notification']
        #swagger.summary = 'Gửi thông báo cho người dùng'
        #swagger.description = 'Chỉ dành cho ADMIN: Gửi thông báo đến người dùng được chỉ định thông qua ID'
    */
    notificationController.sendNotification);
router.post('/broadcast', Authentication, AdminAuthentication, 
    /* 
        #swagger.tags = ['Notification']
        #swagger.summary = 'Gửi thông báo cho tất cả người dùng'
        #swagger.description = 'Chỉ dành cho ADMIN: Gửi thông báo đến tất cả người dùng của hệ thống'
    */
    notificationController.broadcastNotification);

module.exports = router;