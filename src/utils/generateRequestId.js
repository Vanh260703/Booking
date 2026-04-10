const crypto = require('crypto');
function generateRequestId(type) {
    if (type === 'query') {
        return 'QR' + Date.now() + crypto.randomBytes(3).toString('hex');
    }

    if (type === 'refund') {
        return 'RF' + Date.now() + crypto.randomBytes(3).toString('hex');
    }

    return Date.now() + crypto.randomBytes(3).toString('hex');
}

module.exports = generateRequestId;