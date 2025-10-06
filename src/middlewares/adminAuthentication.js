const jwt = require('jsonwebtoken');

function AdminAuthentication(req, res, next) {
    const user = req.user;
    if (user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Bạn không đủ điều kiện để truy cập!',
        });
    };
    next();
}


module.exports = AdminAuthentication;