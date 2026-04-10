
const express = require('express');
const router = express.Router();

const paymentController = require('../app/controllers/PaymentController');
const Authentication = require('../middlewares/authentication');
const OwnerMiddleware = require('../middlewares/ownerMiddleware');
const AdminAuthentication = require('../middlewares/adminAuthentication');

// USER 
router.post('/create', 
    /*
        #swagger.tags = ['Payment']
        #swagger.summary = 'Khởi tạo giao dịch thanh toán mới'
        #swagger.description = 'Tạo giao dịch thanh toán cho một đơn đặt phòng. Hỗ trợ cả MOMO và VNPAY.'
    */ 
   paymentController.create);
router.post('/retry-payment', Authentication, 
    /* 
        #swagger.tags = ['Payment']
        #swagger.summary = 'Thử lại giao dịch thanh toán'
        #swagger.description = 'Nếu giao dịch thanh toán trước đó thất bại hoặc bị gián đoạn, người dùng có thể thử lại tại đây.'
     */ 
    paymentController.retryPayment);
router.get('/transaction', 
    /* 
        #swagger.tags = ['Payment']
        #swagger.summary = 'Lấy thông tin giao dịch thanh toán'
        #swagger.description = 'Truy xuất thông tin chi tiết của giao dịch hiện tại, bao gồm mã giao dịch, trạng thái và số tiền.'
    */
   paymentController.transaction);

// MOMO 
router.post('/momo_callback', 
    /* 
        #swagger.tags = ['Payment']
        #swagger.summary = 'Callback từ MOMO'
        #swagger.description = 'Endpoint dùng để MOMO gửi kết quả thanh toán về hệ thống sau khi người dùng hoàn tất thanh toán. Không cần xác thực.'
    */
   paymentController.momoCallback);
// VNPAY
router.get('/vnp_return', 
    /* 
        #swagger.tags = ['Payment']
        #swagger.summary = 'Callback từ VNPAY'
        #swagger.description = 'Endpoint dùng để VNPAY gửi kết quả thanh toán về hệ thống. Không cần xác thực.'
    */
   paymentController.vnpReturn);

module.exports = router;