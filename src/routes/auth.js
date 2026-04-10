
const express = require('express');
const router = express.Router();
const authController = require('../app/controllers/AuthController');
const passport = require('../services/passport');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

const optionalAuth = require('../middlewares/optionalAuth');
const authentication = require('../middlewares/authentication');

router.post('/register', 
    /* 
        #swagger.tags = ['Auth']
        #swagger.summary = 'Đăng ký tài khoản người dùng'
        #swagger.description = 'Tạo tài khoản người dùng mới trong hệ thống.'
    */
    authController.register
);

router.post('/register-owner', 
    /* 
        #swagger.tags = ['Auth']
        #swagger.summary = 'Đăng ký tài khoản chủ khách sạn'
        #swagger.description = 'Tạo tài khoản dành cho đối tác chủ khách sạn.'
    */
    authController.registerOwner
);

router.post('/login', 
    /* 
        #swagger.tags = ['Auth']
        #swagger.summary = 'Đăng nhập'
        #swagger.description = 'Đăng nhập bằng email và mật khẩu. Trả về cookie chứa JWT.'
    */
    authController.login
);

router.post('/login-admin', authController.loginAdmin);

router.post('/login-hotel-owner', authController.loginHotelOwner);

router.post('/logout', 
    /* 
        #swagger.tags = ['Auth']
        #swagger.summary = 'Đăng xuất'
        #swagger.description = 'Xóa cookie JWT và đăng xuất người dùng khỏi hệ thống.'
    */
    authController.logout
);

router.post('/refresh-token', 
    /* 
        #swagger.tags = ['Auth']
        #swagger.summary = 'Làm mới token'
        #swagger.description = 'Tạo access token mới dựa trên refresh token lưu trong cookie.'
    */
    authController.refreshToken
);

router.post('/forgot-password', 
    /* 
        #swagger.tags = ['Auth']
        #swagger.summary = 'Quên mật khẩu'
        #swagger.description = 'Gửi email đặt lại mật khẩu cho người dùng.'
    */
    authController.forgotPassword
);

router.post('/reset-password', 
    /* 
        #swagger.tags = ['Auth']
        #swagger.summary = 'Đặt lại mật khẩu'
        #swagger.description = 'Cập nhật mật khẩu mới thông qua mã token trong email.'
    */
    authController.resetPassword
);

router.post('/verify-email', 
    /* 
        #swagger.tags = ['Auth']
        #swagger.summary = 'Gửi email xác minh'
        #swagger.description = 'Gửi link xác minh tài khoản đến email của người dùng.'
    */
    authController.verifyEmail
);

router.get('/verify-email/:token', 
    /* 
        #swagger.tags = ['Auth']
        #swagger.summary = 'Xác minh tài khoản qua email'
        #swagger.description = 'Xác nhận người dùng khi họ truy cập link trong email xác minh.'
    */
    authController.verifyEmailWithToken
);

// ------------------- GOOGLE AUTH -------------------

router.get('/google', 
    /*  
        #swagger.tags = ['Auth']
        #swagger.summary = 'Đăng nhập bằng Google'
        #swagger.description = 'Chuyển hướng người dùng đến trang đăng nhập Google.'
    */
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/redirect/google',
    /* 
        #swagger.tags = ['Auth']
        #swagger.summary = 'Xác thực Google callback'
        #swagger.description = 'Nhận phản hồi từ Google, tạo JWT, và lưu vào cookie.'
    */
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    (req, res) => {
        const user = req.user;
        console.log(user);
        const accessToken = generateAccessToken({ id: user._id, email: user.email, name: user.name, role: 'user' });
        const refreshToken = generateRefreshToken({ id: user._id, email: user.email, name: user.name, role: 'user' });

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
            path: '/',
            maxAge: 15 * 60 * 1000
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
            path: '/',
            maxAge: 7 * 60 * 60 * 1000
        });

        res.redirect('http://localhost:5500/FE/index.html');

    }
);

// ------------------- FACEBOOK AUTH -------------------

router.get('/facebook', 
    /* 
        #swagger.tags = ['Auth']
        #swagger.summary = 'Đăng nhập bằng Facebook'
        #swagger.description = 'Chuyển hướng người dùng đến trang đăng nhập Facebook.'
    */
    passport.authenticate('facebook', { scope: ['email'], session: false, state: false })
);

router.get('/facebook/callback', 
    /* 
        #swagger.tags = ['Auth']
        #swagger.summary = 'Xác thực Facebook callback'
        #swagger.description = 'Nhận phản hồi từ Facebook, tạo JWT, và lưu vào cookie.'
    */
    passport.authenticate('facebook', { session: false, state: false }),
    (req, res) => {
        const user = req.user;
    
        const payload = {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar
        };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
            path: '/',
            maxAge: 15 * 60 * 1000
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
            path: '/',
            maxAge: 7 * 60 * 60 * 1000
        });

        res.redirect('http://localhost:5500/FE/index.html');
    }
);

router.get('/me', optionalAuth, authController.checkLogin);

module.exports = router;