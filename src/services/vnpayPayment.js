const moment = require('moment');
const { sortObject } = require('../utils/sortObject'); 
const crypto = require('crypto');
const generateRequestId = require('../utils/generateRequestId');
const Payment = require('../app/models/Payment');
const VNP_TMNCODE = process.env.VNP_TMNCODE;
const VNP_HASHSECRET = process.env.VNP_HASHSECRET;
const VNP_URL = process.env.VNP_URL;
const VNP_API = process.env.VNP_API;
const VNP_RETURNURL = process.env.VNP_RETURNURL;

function signVnpParams(params) {
    // Sắp xếp theo thứ tự Alphabet
    const sorted = Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== null)
        .sort()
        .reduce((obj, key) => {
            obj[key] = params[key];
            return obj;
        }, {});

    // Nối thành query string
    const signData = new URLSearchParams(sorted).toString();

    // Tạo chứ ký SHA512
    return crypto.createHmac('sha512', VNP_HASHSECRET)
        .update(signData)
        .digest('hex');
}

function verifyVnpaySignature(query) {
    const secureHash = query.vnp_SecureHash;

    delete query.vnp_SecureHash;
    delete query.vnp_SecureHashType;

    const signed = signVnpParams(query);

    return secureHash === signed;
}

const createVnpayPayment = async (totalAmount, bookingNumber, methodPayment, ipAddr) => {
    try {
        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');
        const expireDate = moment(date).add(15, 'minutes').format('YYYYMMDDHHmmss');

        let vnp_Params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: VNP_TMNCODE,
            vnp_Locale: 'vn',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: bookingNumber,
            vnp_OrderInfo: `Thanh toan cho booking ${bookingNumber}`,
            vnp_OrderType: 'other',
            vnp_Amount: totalAmount * 100,
            vnp_ReturnUrl: VNP_RETURNURL,
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: createDate,
            vnp_ExpireDate: expireDate,
            vnp_BankCode: methodPayment,
        };

        const secureHash = signVnpParams(vnp_Params);
        vnp_Params['vnp_SecureHash'] = secureHash;

        const query = Object.entries(vnp_Params)
            .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
            .join('&')
            .replace(/\+/g, '%20');

        const finalUrl = `${VNP_URL}?${query}`;
        console.log('FINAL URL', finalUrl);

        return finalUrl;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

const handleVnpayReturn = async (query, VNP_HASHSECRET) => {
    const isValid = verifyVnpaySignature(query, VNP_HASHSECRET);

    if (!isValid) return { success: false, message: 'Invalid signature'};

    const { vnp_ResponseCode, vnp_TxnRef, vnp_TransactionStatus, vnp_PayDate, vnp_TransactionNo, vnp_Amount } = query;

    if (vnp_ResponseCode !== '00') {
        await Payment.findOneAndUpdate({ bookingNumber: vnp_TxnRef }, {
            status: 'failed'
        });
        return { success: false, message: vnp_TransactionStatus};
    }

    const returnData = {
        success: true,
        message: vnp_TransactionStatus,
        bookingNumber: vnp_TxnRef,
        transactionDate: vnp_PayDate,
        transactionNo: vnp_TransactionNo,
        amount: Number(vnp_Amount) / 100,
    };

    return returnData;
}

const queryVnpayTransaction = async (payment, ipAddr) => {
    try {
        if (!payment || !payment.bookingNumber) throw new Error('Không tìm thấy thanh toán hợp lệ!'); 

        const date = new Date();
        // Vnpay parameters
        const vnp_RequestId = generateRequestId('query');
        const vnp_Version = '2.1.0';
        const vnp_Command = 'querydr';
        const vnp_TmnCode = VNP_TMNCODE;
        const vnp_TxnRef = payment.bookingNumber;
        const vnp_OrderInfo = 'Query booking';
        const vnp_TransactionDate = payment.transactionDate;
        const vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');
        const vnp_IpAddr = ipAddr;

        // Tạo checksum
        const data = vnp_RequestId + '|' + vnp_Version + '|' + vnp_Command + '|' + vnp_TmnCode + '|' + vnp_TxnRef + '|' + vnp_TransactionDate + '|' + vnp_CreateDate + '|' + vnp_IpAddr + '|' + vnp_OrderInfo;
        console.log('DATA: ', data);

        // Hash Data
        const vnp_SecureHash = crypto.createHmac('sha512', VNP_HASHSECRET)
            .update(data)
            .digest('hex');

        const requestBody = JSON.stringify({
            vnp_RequestId,
            vnp_Version,
            vnp_Command,
            vnp_TmnCode,
            vnp_TxnRef,
            vnp_OrderInfo,
            vnp_TransactionDate,
            vnp_CreateDate,
            vnp_IpAddr,
            vnp_SecureHash,
        });

       const response = await fetch(
            'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: requestBody
            }
       );

       const queryData = await response.json();
       console.log('===== QUERY VNPAY RESPONSE =====');
       console.log(queryData);

       return queryData;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

const refundVnpayPayment = async (payment, ipAddr) => {
    try {
        if (!payment || !payment.bookingNumber) throw new Error('Không tìm thấy thanh toán hợp lệ!'); 

        const date = new Date();
        // Vnpay Paramerters
        const vnp_RequestId = generateRequestId('refund');
        const vnp_Version = '2.1.0';
        const vnp_Command = 'refund';
        const vnp_TmnCode = VNP_TMNCODE;
        const vnp_TransactionType = '02';
        const vnp_TxnRef = payment.bookingNumber;
        const vnp_Amount = payment.amount * 100;
        const vnp_OrderInfo = 'Hoan tien GD ma: ' + vnp_TxnRef;
        const vnp_TransactionNo = payment.transactionId;
        const vnp_TransactionDate = payment.transactionDate;
        const vnp_CreateBy = payment.user.name;
        const vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');
        const vnp_IpAddr = ipAddr;

        // Tạo checksum
        const data = vnp_RequestId + '|' + vnp_Version + '|' + vnp_Command + '|' + vnp_TmnCode + '|' + vnp_TransactionType + '|' + vnp_TxnRef + '|' + vnp_Amount + '|' + vnp_TransactionNo + '|' + vnp_TransactionDate + '|' + vnp_CreateBy + '|' + vnp_CreateDate + '|' + vnp_IpAddr + '|' + vnp_OrderInfo;

        // Hash Data
        const vnp_SecureHash = crypto.createHmac('sha512', VNP_HASHSECRET)
            .update(data)
            .digest('hex');

        const requestBody = JSON.stringify({
            vnp_RequestId,
            vnp_Version,
            vnp_Command,
            vnp_TmnCode,
            vnp_TransactionType,
            vnp_TxnRef,
            vnp_Amount,
            vnp_OrderInfo,
            vnp_TransactionNo,
            vnp_TransactionDate,
            vnp_CreateBy,
            vnp_CreateDate,
            vnp_IpAddr,
            vnp_SecureHash
        });

        console.log('===== REQUEST VNPAY REFUND =====');
        console.log(requestBody);
        const response = await fetch(
            'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: requestBody
            }
        );

        const refundData = await response.json();
        console.log('===== REFUND VNPAY RESPONSE =====');
        console.log(refundData);

        return refundData;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

const saveRefundVnpay = async (payment, ipAddr, attempt = 1, reason) => {
    try {
        if (!payment || !payment.bookingNumber) throw new Error('Không tìm thấy thanh toán hợp lệ!'); 

        const bookingNumber = payment.bookingNumber;
        console.log(`Bắt đầu refund lần ${attempt} cho booking: ${bookingNumber}`);
        // Kiểm tra query trước khi refund
        const queryResult = await queryVnpayTransaction(payment, ipAddr);

        if (Number(queryResult.vnp_ResponseCode) !== 0  || queryResult.vnp_TransactionStatus !== '00') {
            if (attempt < 3) {
                await new Promise(res => setTimeout(res, 30000));
                return saveRefundVnpay(payment, attempt + 1, reason);
            } else {
                console.error(`Query thất bại sau ${attempt} lần cho booking ${bookingNumber}`);
            }
            return;
        }

        const refundResult = await refundVnpayPayment(payment, ipAddr);

        if (refundResult.vnp_ResponseCode === '94') {
            console.log(`⚠️ Refund bị trùng lặp cho booking=${bookingNumber}. Đợi 60sNumber rồi thử lại...`);
            setTimeout(() => saveRefundVnpay(payment, ipAddr, attempt + 1), 60000);
            return;
        }

        if (Number(refundResult.vnp_ResponseCode) === 0) {
            console.log("✅ Hoàn tiền thành công:", refundResult);
            const refund = {
                amount: Number(refundResult.vnp_Amount) / 100,
                reason,
                status: 'successed',
                refundedAt: new Date(),
            };

            payment.refund = refund;
            await payment.save();
            return;
        } else {
            await Payment.findOneAndUpdate({ bookingNumber }, {
                $set: { 'refund.status': 'failed' }
            });
            throw new Error(`Refund thất bại: ${refundResult.message}`);
        }
    } catch (err) {
        console.log(err);
        if (attempt < 3) {
            await new Promise(res => setTimeout(res, 30000));
            return saveRefundVnpay(payment, attempt + 1, reason);
        } else {
            console.error(`Refund thất bại sau ${attempt} lần cho booking: ${bookingNumber}`);
            await Payment.findOneAndUpdate({ bookingNumber }, {
                refund: {
                    status: 'failed'
                }
            });
        }
    }
}

module.exports = { createVnpayPayment, handleVnpayReturn, queryVnpayTransaction, refundVnpayPayment, saveRefundVnpay };