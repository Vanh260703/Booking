const moment = require('moment');

function generateBookingCode(totalPrice) {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const timeSuffix = Date.now().toString().slice(-2); // 2 chữ số cuối của timestamp
    return `BK-${randomNumber}${timeSuffix}`;
}

module.exports = generateBookingCode;