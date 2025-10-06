const jwt = require('jsonwebtoken');

function Authentication(req, res, next) {
    const accessToken = req.cookies.accessToken;
    console.log('ACCESS TOKEN: ',accessToken);
    if (!accessToken) {
        return res.status(401).json({
            success: false,
            message: 'Không có access token trong cookie',
        });
    }

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.log('access token lỗi', err.message);
            return res.status(403).json({
                success: false,
                message: 'Access Token không hợp lệ hoặc hết hạn',
            });
        }
        req.user = user;
        next();
    });
}

module.exports = Authentication;