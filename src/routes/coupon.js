const express = require('express');
const router = express.Router();

const CouponController = require('../app/controllers/CouponController');

const OptionalAuth = require('../middlewares/optionalAuth');
const Authentication = require('../middlewares/authentication');
const OwnerMiddleware = require('../middlewares/ownerMiddleware');
const AdminAuthentication = require('../middlewares/adminAuthentication');

router.get('/change-points-to-coupon', Authentication, 
    /*
        #swagger.tags = ['Coupon']
        #swagger.summary = 'Đổi coupon bằng điểm'
        #swagger.description = 'Đổi coupon bằng điểm của người dùng'
     */
    CouponController.changePointsToCoupon);
router.get('/available', Authentication, 
    /*
        #swagger.tags = ['Coupon']
        #swagger.summary = 'Xem những coupon hợp lệ với booking'
        #swagger.description = 'Xem những coupon có thể sử dụng được của booking'
        #swagger.parameters['bookingNumber'] = { in: 'query', required: true, type: 'string' }
     */
    CouponController.availableCoupon);
router.get('/validate/:code', Authentication, 
    /*
        #swagger.tags = ['Coupon']
        #swagger.summary = 'Kiểm tra tính hợp lệ của coupon'
        #swagger.description = 'Kiểm tra xem coupon có hợp lệ với booking thông qua code hay không'
        #swagger.parameters['bookingNumber'] = { in: 'query', required: true, type: 'string' }
        #swagger.parameters['code'] = { in: 'params', required: true, type: 'string' }
     */
    CouponController.validateCode);
router.post('/apply/:code', Authentication, 
    /*
        #swagger.tags = ['Coupon']
        #swagger.summary = 'Áp dụng voucher lên booking'
        #swagger.description = 'Áp dụng voucher lên booking được chỉ định',
        #swagger.parameters['bookingNumber'] = { in: 'query', required: true, type: 'string' }
        #swagger.parameters['code'] = { in: 'params', required: true, type: 'string' }
     */
    CouponController.applyCoupon);
router.post('/redeem/:code', Authentication, 
    /*
        #swagger.tags = ['Coupon']
        #swagger.summary = 'Claim coupon thông qua code'
        #swagger.description = 'Claim coupon thông qua code'
        #swagger.parameters['code'] = { in: 'params', required: true, type: 'string' }
     */
    CouponController.claimCoupon);

// ADMIN & OWNER
router.get('', Authentication, 
    /*
        #swagger.tags = ['Coupon']
        #swagger.summary = 'Lấy danh sách tất cả coupon'
        #swagger.description = 'Lấy danh sách tất cả coupon theo quyền hạn. Nếu là admin sẽ thấy toàn bộ coupon, còn nếu là hotel_owner thì chỉ thấy coupon do chính họ tạo.'
    */
    CouponController.coupons);
router.get('/used', Authentication, 
    /*
        #swagger.tags = ['Coupon']
        #swagger.summary = 'Lấy danh sách coupon đã được sử dụng'
        #swagger.description = 'Trả về danh sách các coupon đã được người dùng sử dụng. Có thể truyền query ?from=&to= để lọc theo thời gian sử dụng.'
        #swagger.parameters['from'] = { description: 'Ngày bắt đầu (YYYY-MM-DD)', in: 'query', required: false, type: 'string' }
        #swagger.parameters['to'] = { description: 'Ngày kết thúc (YYYY-MM-DD)', in: 'query', required: false, type: 'string' }
    */
    CouponController.usedCoupons);
router.post('', Authentication, 
    /*
        #swagger.tags = ['Coupon']
        #swagger.summary = 'Tạo mới coupon'
        #swagger.description = 'Tạo một coupon mới. Hotel owner chỉ có thể tạo coupon cho khách sạn của mình, trong khi admin có thể tạo coupon cho toàn hệ thống.'
    */
    CouponController.createCoupon);
router.put('/:code', Authentication, 
    /*
        #swagger.tags = ['Coupon']
        #swagger.summary = 'Cập nhật thông tin coupon'
        #swagger.description = 'Cập nhật thông tin coupon theo code. Chỉ admin hoặc chủ sở hữu (hotel_owner đã tạo coupon đó) mới có quyền chỉnh sửa.'
        #swagger.parameters['code'] = { in: 'params', required: true, type: 'string' }
    */
    CouponController.updateCoupon);
router.delete('/:code', Authentication, 
    /*
        #swagger.tags = ['Coupon']
        #swagger.summary = 'Xoá coupon'
        #swagger.description = 'Xoá coupon theo code. Chỉ admin hoặc chủ sở hữu coupon có quyền thực hiện hành động này.'
        #swagger.parameters['code'] = { in: 'params', required: true, type: 'string' }

    */
    CouponController.deleteCoupon);

module.exports = router;