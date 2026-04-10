const axios = require('axios');
const crypto = require('crypto');
const Booking = require('../app/models/Booking');
const Payment = require('../app/models/Payment');
const generateRequestId = require('../utils/generateRequestId');
const ACCESSKEY = process.env.MOMO_ACCESS_KEY;
const SECRETKEY = process.env.MOMO_SECRET_KEY;

const createMomoPayment = async (totalPrice, bookingNumber) => {
    try {
        // Momo parameters
        const partnerCode = 'MOMO';
        const requestId = generateRequestId();
        const amount = totalPrice;
        const orderId = bookingNumber;
        const orderInfo = 'pay with MoMo';
        const redirectUrl = 'http://localhost:3000/api/payments/transaction';
        const ipnUrl = 'https://c4fe5b298284.ngrok-free.app/api/payments/momo_callback';
        const requestType = 'payWithMethod';
        const extraData = '';
        const autoCapture = true;
        const lang = 'vi';

        // Tạo signature 
        const rawSignature = `accessKey=${ACCESSKEY}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
        console.log('RAW SIGNATURE: ', rawSignature);

        // Hash Signature
        const signature = crypto.createHmac('sha256', SECRETKEY)
            .update(rawSignature)
            .digest('hex')
        console.log('SIGNATURE: ', signature);

        const requestBody = JSON.stringify({
            partnerCode,
            partnerName: 'Test',
            storeId: 'MomoTestStore',
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            lang,
            requestType,
            autoCapture,
            extraData,
            signature,
        });

        const response = await fetch(
            'https://test-payment.momo.vn/v2/gateway/api/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: requestBody,
        });

       const data = await response.json();
       console.log('===== RESPONSE CREATE MOMO =====');
       console.log(data);

       return data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

const queryMomoTransaction = async (bookingNumber) => {
    try {
        
        // Momo parameters
        const partnerCode = 'MOMO';
        const requestId = generateRequestId('query');
        const orderId = bookingNumber;
        const lang = 'vi';

        // Tạo signature
        const rawSignature = `accessKey=${ACCESSKEY}&orderId=${orderId}&partnerCode=${partnerCode}&requestId=${requestId}`;
        console.log('RAW SIGNATURE: ', rawSignature);

        // Hash Signature
        const signature = crypto.createHmac('sha256', SECRETKEY)
            .update(rawSignature)
            .digest('hex')
        console.log('===== SIGNATURE =====');
        console.log(signature);

        const requestBody = JSON.stringify({
            partnerCode,
            requestId,
            orderId,
            signature,
            lang,
        });

        const response = await fetch(
            'https://test-payment.momo.vn/v2/gateway/api/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: requestBody
            }
        );

        const data = await response.json();

        data.resultCode === 0 ? console.log('QUERY THÀNH CÔNG!') : console.log('QUERY THẤT BẠI!');
        
        console.log('===== MOMO QUERY RESPONSE =====');
        console.log(data);

        return data;
    } catch (err) {
        console.log(err);
        throw err;
    }
} 

const refundMomoPayment = async (payment, reason) => {
    try {
        if (!payment || !payment.bookingNumber) throw new Error('Không tìm thấy thanh toán hợp lệ!'); 

        // Momo parameters
        const partnerCode = 'MOMO';
        const orderId = 'RF' + payment.bookingNumber;
        const requestId = generateRequestId('refund');
        const amount = payment.amount;
        const transId = payment.transactionId;
        const lang = 'vi';
        const description = reason;

        // Tạo signature
        const rawSignature = `accessKey=${ACCESSKEY}&amount=${amount}&description=${description}&orderId=${orderId}&partnerCode=${partnerCode}&requestId=${requestId}&transId=${transId}`;
        console.log('RAW SIGNATURE: ', rawSignature);

        // Hash Signature
        const signature = crypto.createHmac('sha256', SECRETKEY)
            .update(rawSignature)
            .digest('hex')
        console.log('===== SIGNATURE =====');
        console.log(signature);

        const requestBody = JSON.stringify({
            partnerCode,
            orderId,
            requestId,
            amount,
            transId,
            lang,
            description,
            signature
        });

        const response = await fetch(
            'https://test-payment.momo.vn/v2/gateway/api/refund', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: requestBody
            }
        );

        const data = await response.json();

        data.resultCode === 0 ? console.log('HOÀN TIỀN THÀNH CÔNG!!!') : console.log('HOÀN TIỀN THẤT BẠI!');

        console.log('===== MOMO REFUND RESPONSE =====');
        console.log(data);

        return data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

const saveRefundMomo = async (payment, attempt = 1, reason) => {
    try  {
        if (!payment || !payment.bookingNumber) throw new Error('Không tìm thấy thanh toán hợp lệ!'); 

        console.log(`Bắt đầu refund lần ${attempt} cho booking: ${payment.bookingNumber}`);

        // Query trước khi refund 
        const queryResult = await queryMomoTransaction(payment.bookingNumber);

        if (queryResult.resultCode !== 0) {
            // Attempt < 3 thì thử query lại sai 30s
            if (attempt < 3) {
                console.log(`Query MoMo lỗi: ${queryResult.resultCode}. Thử lại sau 30s!`);
                await new Promise(res => setTimeout(res, 30000));
                return saveRefundMomo(payment, attempt + 1, reason);
            } else {
                throw new Error(`Query MoMo lỗi: ${queryResult.message}!!!`);
            }
        }

        // Kiểm tra xem giao dịch có đang được thực hiện hay không
        if (queryResult.refundTrans && queryResult.refundTrans.length > 0) {
            console.log('Giao dịch đã và đang được hoàn tiền!');
            await Payment.findOneAndUpdate({ bookingNumber: payment.bookingNumber}, {
                refund: {
                    status: 'successed',
                    amount: queryResult.refundTrans.amount,
                },
            });
            return;
        }

        // Thực thi refund 
        const refundResult = await refundMomoPayment(payment, reason);

        if (refundResult.resultCode === 0) {
            console.log(`Refund thành công cho booking: ${payment.bookingNumber}!`);
            await Payment.findOneAndUpdate({ bookingNumber: payment.bookingNumber}, {
                $set: { 
                    'refund.amount': refundResult.amount,
                    'refund.reason': reason,
                    'refund.status': 'successed',
                    'refund.refundedAt': new Date(),
                }});
        } else {
            await Payment.findOneAndUpdate({ bookingNumber: payment.bookingNumber }, {
                $set: { 'refund.status': 'failed' }
            });
            throw new Error(`Refund thất bại: ${refundResult.message}!`);
        }
    } catch (err) {
        console.log(`Lỗi refund lần ${attempt} cho booking: ${payment.bookingNumber}: `, err.message);

        if (attempt < 3) {
            await new Promise(res => setTimeout(res, 30000));
            return saveRefundMomo(payment, attempt + 1, reason);
        } else {
             console.log(`Refund thất bại sau ${attempt} lần cho booking: ${payment.bookingNumber}`);
            await Payment.findOneAndUpdate({ bookingNumber: payment.bookingNumber }, {
                $set: { 'refund.status': 'failed' }
            });
        }
    }
}

module.exports = { createMomoPayment, queryMomoTransaction, refundMomoPayment, saveRefundMomo };