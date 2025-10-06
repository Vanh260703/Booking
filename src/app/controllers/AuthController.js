const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const verifyJwt = promisify(jwt.verify);

const { generateAccessToken, generateRefreshToken, generateResetPassword, generateVerifyToken } = require('../../services/generateToken');
const { sendResetPassword, sendVerifyAccount } = require('../../services/sendingEmail');
const salt = 10;

class AuthController {
    // [POST] /api/auth/register
    async register(req, res) {
        try {
            const user = new User(req.body);
            const exisingUser = await User.findOne({ 
                $or: [
                    { username: user.username }, 
                    { email: user.email } 
                ]
            });
            if (exisingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Tên đăng nhập đã tồn tại, vui lòng nhập lại!',
                });
            };

            // hash password
            const hashedPassword = await bcrypt.hash(user.password, salt);
            user.password = hashedPassword;

            // Lưu người dùng vào database
            await user.save();

            return res.status(200).json({
                success: true,
                message: 'Đăng kí người dùng thành công!',
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server!',
                error: err.message,
            })
        }
    }

    // [POST] /api/auth/login
    async login(req, res) {
        try {
            const { username, password } = req.body;
            const user = await User.findOne({username});
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Tên đăng nhập không tồn tại. Vui lòng thử lại!',
                });
            }

            const passwordCorrect = await bcrypt.compare(password, user.password);
            if (!passwordCorrect) {
                return res.status(400).json({
                    success: false,
                    message: 'Tài khoản hoặc mật khẩu không đúng, vui lòng kiểm tra lại!',
                });
            }

            // Tạo accessToken cho user
            const accessToken = generateAccessToken({
                id: user._id,
                username: user.username,
                name: user.name,
                role: user.role,
            });

            // Tạo refreshToken cho user
            const refreshToken = generateRefreshToken({
                id: user._id,
                username: user.username,
                name: user.name,
                role: user.role,
            });

            // Set cookie
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'Lax',
                path: '/',
                maxAge: 24 * 60 * 60 * 1000 // 1 ngày
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'Lax',
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
            });

            return res.status(200).json({
                success: true,
                message: 'Đăng nhập thành công!',
                user: { name: user.name, username: user.username, accessToken, refreshToken }
            });
        } catch (err) {
            console.log(err);
            return res.statuts(500).json({
                success: false,
                message: 'Lỗi phía server',
                error: err.message,
            });
        }
    }

    // [POST] /api/auth/logout
    async logout(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Không có refresh token trong cookie',
                });
            }

            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');

            return res.status(200).json({
                success: true,
                message: 'Đăng xuất thành công!',
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

    // [POST] /api/auth/refresh-token
    async refreshToken(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu refresh token!',
                });
            }

            let user;
            try {
                user = await verifyJwt(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            } catch (err) {
                return res.status(401).json({
                    success: false,
                    message: 'Refresh token không hợp lệ hoặc đã hết hạn',
                })
            }
            
            const userPayload = {
                id: user.id,
                username: user.username,
                role: user.role,
            };

            const newAccessToken = generateAccessToken(userPayload);

            res.cookie('accessToken', newAccessToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'Lax',
                maxAge: 15 * 60 * 1000 // 15 phút
            });

            return res.status(200).json({
                success: true,
                message: 'Làm mới access token thành công',
                accessToken: newAccessToken,
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

    // [POST] /api/auth/forgot-password
    async forgotPassword(req, res) {
        try {
            const email = req.body.email;
            const user = await User.findOne({email});
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Không tìm thấy email!',
                });
            }

            const resetToken = generateResetPassword({userID: user._id});
            user.passwordResetToken = resetToken;
            user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10p

            await user.save();

            const resetLink = `http://localhost:3000/api/auth/reset-password/${resetToken}`;

            const sendEmail = await sendResetPassword(email, resetLink);

            if (sendEmail) {
                return res.status(200).json({
                    success: true,
                    message: '✅ Gửi email thành công',
                    resetToken,
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: '❌ Gửi email thất bại',
                });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
                error: err.message,
            });
        }
    }

    // [POST] /api/auth/reset-password/:token
    async resetPassword(req, res) {
        try {
            const token = req.params.token;
            const { password, confirmPassword } = req.body;

            let decoded;
            try {
                decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
            } catch (err) {
                console.log(err);
                return res.status(400).json({
                    success: false,
                    message: 'Token không hợp lệ hoặc đã quá hạn',
                    error: err.message,
                });
            }
            const user = await User.findById(decoded.userID);
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Không tìm thấy user',
                })
            }

            // Kiểm tra password mới có trùng lặp với password cũ không
            const comparePassword = await bcrypt.compare(password, user.password);
            if (comparePassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Mật khẩu mới không được trùng với mật khẩu cũ!',
                });
            }

            // Kiểm tra hạn của token 
            if (user.passwordResetExpires < Date.now()) {
                return res.status(400).json({
                    success: false,
                    message: 'Token đã quá hạn!',
                });
            }

            // hash password mới
            const newPassword = await bcrypt.hash(password, salt);
            user.password = newPassword;

            // Lưu vào database
            await user.save();

            return res.status(200).json({
                success: true,
                message: 'Thay đổi mật khẩu thành công!',
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

    // [POST] /api/auth/verify-email
    async verifyEmail(req, res) {
        try {
           const accessToken = req.cookies.accessToken; 
           if (!accessToken) {
            return res.status(401).json({
                success: false,
                message: 'Không có token!',
            });
           }

           try {
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Không tìm thấy người dùng!',
                });
            }

            const verifyToken = generateVerifyToken({ id: user.id });

            const verifyLink = `http://localhost:3000/api/auth/verify-email/${verifyToken}`;

            const sendEmail = await sendVerifyAccount(user.email, verifyLink);
            if (sendEmail) {
                return res.status(200).json({
                    success: true,
                    message: 'Gửi email xác thực thành công!',
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Gửi email xác thực thất bại'
                })
            }
           } catch (err) {
            console.log(err);
            return res.status(401).json({
                success: false,
                message: 'Token không hợp lệ hoặc đã quá hạn',
                error: err.message,
            });
           }
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
                error: err.message,
            });
        }
    }

    // [GET] /api/auth/verify-email/:token
    async verifyEmailWithToken(req, res) {
        try {
            const token = req.params.token;
            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: 'Không tìm thấy token!',
                });
            }

            try {
                const decoded = jwt.verify(token, process.env.EMAIL_VERIFY_SECRET);
                const user = await User.findById(decoded.id);

                if (!user) {
                    return res.status(400).json({
                        success: false,
                        message: 'Không tìm thấy người dùng!',
                    });
                }

                user.isVerify = true;

                await user.save();

                return res.status(200).json({
                    success: true,
                    message: 'Xác thực người dùng thành công!',
                })
            } catch (err) {
                console.log(err);
                return res.status(400).json({
                    success: false,
                    message: 'Token không hợp lệ hoặc đã hết hạn!',
                });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
                error: err.message,
            });
        }
    }

    // [GET] /api/auth/login
    async loginPage(req, res) {
        res.render('AuthView/login');
    }
    
}

module.exports = new AuthController();