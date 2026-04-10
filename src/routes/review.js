const express = require('express');
const router = express.Router();

const reviewController = require('../app/controllers/ReviewController');

const Authentication = require('../middlewares/authentication');
const OwnerMiddleware = require('../middlewares/ownerMiddleware');
const AdminAuthentication = require('../middlewares/adminAuthentication');

router.get('/:hotelId', 
    /* 
        #swagger.tags = ['Review']
        #swagger.summary = 'Lấy tất cả review của khách sạn'
        #swagger.description = 'Cho phép mọi người xem review của khách sạn'
        #swagger.parameters['hotelId'] = { in: 'path', description: 'ID khách sạn muốn xem review', required: true, type: 'string'}
    */
    reviewController.reviewsInHotel);
router.put('/:reivew', Authentication, 
    /* 
        #swagger.tags = ['Review']
        #swagger.summary = 'Chính sửa comment'
        #swagger.description = 'Cho phép người dùng chỉnh sửa comment của bản thân'
        #swagger.parameters['review'] = { in: 'path', description: 'ID review muốn thay đổi comment', required: true, type: 'string'}
    */
    reviewController.fixReview);

module.exports = router;

