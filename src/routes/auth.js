const express = require('express');
const router = express.Router();
const authController = require('../app/controllers/authController');
const passport = require('../services/passport');
const { generateAccessToken, generateRefreshToken } = require('../services/generateToken');

router.get('/login', authController.loginPage);

router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/logout', authController.logout);

router.post('/refresh-token', authController.refreshToken);

router.post('/forgot-password', authController.forgotPassword);

router.post('/reset-password/:token', authController.resetPassword);

router.post('/verify-email', authController.verifyEmail);

router.get('/verify-email/:token', authController.verifyEmailWithToken);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/redirect/google', passport.authenticate('google', { failureRedirect: '/login', session: false}), (req, res) => {
    const user = req.user;

    const accessToken = generateAccessToken({ id: user._id, email: user.email });

    const refreshToken = generateRefreshToken({ id: user._id, email: user.email });

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
        path: '/',
        maxAge: 15 * 60 * 1000 // 15 phút
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
        path: '/',
        maxAge: 7 * 60 * 60 * 1000 // 7 ngày
    });

    res.json({
        success: true,
        message: 'Đăng nhập bằng google thành công!',
        accessToken,
        refreshToken
    });
});

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'], session: false, state: false }));

router.get('/facebook/callback', passport.authenticate('facebook', { session: false, state: false }),  (req, res) => {
    const user = req.user;

    const accessToken = generateAccessToken({ id: user._id, email: user.email });

    const refreshToken = generateRefreshToken({ id: user._id, email: user.email});

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
        path: '/',
        maxAge: 15 * 60 * 1000 // 15 phút
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
        path: '/',
        maxAge: 7 * 60 * 60 * 1000 // 7 ngày
    });

    res.json({
        success: true,
        message: 'Đăng nhập bằng Facebook thành công!',
        accessToken,
        refreshToken,
    });
});

module.exports = router;