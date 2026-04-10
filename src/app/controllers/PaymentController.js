const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const { createMomoPayment, queryMomoTransaction, refundMomoPayment } = require('../../services/momoPayment');
const { createVnpayPayment, handleVnpayReturn, queryVnpayTransaction, refundVnpayPayment } = require('../../services/vnpayPayment');
const { response } = require('express');
const crypto = require('crypto');
class PaymentController {
    // [POST] /api/payments/create
    async create (req, res) {
        try {
            const { paymentMethod, bankingMethod } = req.body;
            const { totalAmount, bookingNumber } = req.query;
            console.log(totalAmount);
            const ipAddr = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;

            const exisingPayment = await Payment.findOne({ bookingNumber });
            if (exisingPayment) {
                return res.status(400).json({
                    success: false,
                    message: 'Payment đã được khởi tạo rồi!',
                });
            }

            await Payment.create({
                bookingNumber,
                amount: 0,
                method: paymentMethod,
            });


            switch (paymentMethod) {
                case 'momo':
                    const createMomoResult = await createMomoPayment(totalAmount, bookingNumber);

                    if (createMomoResult.resultCode !== 0) {
                        return res.status(400).json({
                            success: false,
                            message: 'Có lỗi khi khởi tạo thanh toán bằng MoMo: ' + createMomoResult.message,
                        })
                    }

                    return res.status(200).json({
                        success: true,
                        message: 'Khởi tạo URL thanh toán bằng MOMO thành công!',
                        payUrl: createMomoResult.payUrl,
                    });
                case 'vnpay':
                    const createVnpayResult = await createVnpayPayment(totalAmount, bookingNumber, bankingMethod, ipAddr);

                    return res.status(200).json({
                        success: true,
                        message: 'Khởi tạo URL thanh toàn bằng VNPAY thành công!',
                        payUrl: createVnpayResult,
                    });
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Phương thức thanh toán không hợp lệ!',
                    });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
                error: err.message,
            })
        }
    }

    // [GET] /api/payments/transaction
    async transaction (req, res) {
        try {
            return res.status(200).json({
                success: true,
                message: 'Thanh toán thành công!'
            })
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
                error: err.message,
            });
        }
    }

    // [POST] /api/payments/retry-payment
    async retryPayment (req, res) {
        try {
            const ipAddr = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;
            const { bookingNumber, paymentMethod, methodPayment } = req.body;
            const payment = await Payment.findOne({ bookingNumber });

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy payment!',
                })
            }

            if (payment.status === 'completed') {
                return res.status(400).json({
                    success: false,
                    message: 'Booking đã được thanh toán!',
                });
            }

            // Thanh toán với MOMO
            if (paymentMethod === 'momo') {
                await Payment.findOneAndUpdate({ bookingNumber }, {
                    $set: { 'method': 'momo' }
                });
                const paymentUrl = await createMomoPayment(payment.amount, bookingNumber);

                return res.status(200).json({
                    success: true,
                    message: 'Đi tới trang thanh toán thành công!',
                    paymentUrl
                });
            }

            // Thanh toán với VNPAY
            if (paymentMethod === 'vnpay') {
                await Payment.findOneAndUpdate({ bookingNumber }, {
                    $set: { 'method': 'vnpay' }
                });

                const paymentUrl = await createVnpayPayment(payment.amount, bookingNumber, methodPayment, ipAddr);

                return res.status(200).json({
                    success: true,
                    message: 'Đi tới trang thanh toán thành công!',
                    paymentUrl
                });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
                error: err.message
            });
        }
    }

    // [POST] /api/payments/momo_callback
    async momoCallback (req, res) {
        try {
            console.log('HÀM CALLBACK ĐANG CHẠY!!!')
            const data = req.body;
            console.log(data);
            const ACCESS_KEY = process.env.MOMO_ACCESS_KEY;
            const SECRET_KEY = process.env.MOMO_SECRET_KEY;

            // Tạo signature
            const rawSignature = `accessKey=${ACCESS_KEY}&amount=${data.amount}&extraData=${data.extraData}&message=${data.message}&orderId=${data.orderId}&orderInfo=${data.orderInfo}&orderType=${data.orderType}&partnerCode=${data.partnerCode}&payType=${data.payType}&requestId=${data.requestId}&responseTime=${data.responseTime}&resultCode=${data.resultCode}&transId=${data.transId}`;
            console.log('RAW SIGNATURE: ', rawSignature);
            const signature = crypto.createHmac('sha256', SECRET_KEY)
                .update(rawSignature)
                .digest('hex');
            
            // Kiểm tra signature
            if (signature !== data.signature) {
                return res.status(404).json({ resultCode: 99, message: 'signature không hợp lệ!'});
            }


            if (data.resultCode !== 0) {
                await Payment.findOneAndUpdate({ bookingNumber: data.orderId }, {
                   $set: { 'status': 'failed' }
                });

                // Gửi thông báo thanh toán thất bại!
                await Notification.create({
                    user: booking.user,
                    type: 'payment_failed',
                    title: `Thanh toán thất bại booking: ${booking.bookingNumber}`,
                    message: `booking ${booking.bookingNumber} chưa được thanh toán. Vui lòng kiểm tra lại!`
                });
                return res.status(200).json({
                    resultCode: data.resultCode,
                    message: data.message,
                });
            }

            const payment = await Payment.findOne({ bookingNumber: data.orderId });

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy payment!'
                });
            }

            if (payment.status === 'completed') {
                return res.status(200).json({ resultCode: 0, message: 'Giao dịch đã được xử lý!'});
            }

            payment.amount = data.amount;
            payment.status = 'completed';
            payment.transactionId = data.transId;
            payment.paidAt = new Date();

            const booking = await Booking.findOne({ bookingNumber: data.orderId });
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy booking!',
                });
            }

            if (!booking.payment || booking.payment.toString() !== payment._id.toString()) {
                booking.payment = payment._id;
            }

            // Gửi thông báo thanh toán thành công
            await Notification.create({
                user: booking.user,
                type: 'payment_success',
                title: `Thanh toán thành công booking: ${booking.bookingNumber}`,
                message: `Chúc mừng bạn đã thanh toán thành công booking: ${booking.bookingNumber}`
            });

            await Promise.all([payment.save(), booking.save()])

            return res.status(200).json({ resultCode: 0, message: 'OK'});

        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
                error: err.message,
            });
        }
    }

    // [GET] /api/payments/vnp_return 
    async vnpReturn (req, res) {
        try {
            const returnData = await handleVnpayReturn(req.query);
            console.log(returnData);
            const payment = await Payment.findOne({ bookingNumber: returnData.bookingNumber});

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy payment!',
                });
            }

            payment.amount = returnData.amount;
            payment.status = 'completed';
            payment.transactionId = returnData.transactionNo;
            payment.transactionDate = returnData.transactionDate;
            payment.paidAt = new Date();

            const booking = await Booking.findOne({ bookingNumber: returnData.bookingNumber });
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy booking!',
                });
            }

           if (!booking.payment || booking.payment.toString() !== payment._id.toString()) {
                booking.payment = payment._id;
            }

            await Promise.all([payment.save(), booking.save()])

            return res.status(200).json({
                success: true,
                message: 'OK' 
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
                error: err.message,
            });
        }
    }
}

module.exports = new PaymentController();