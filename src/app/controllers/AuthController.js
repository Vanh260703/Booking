const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const verifyJwt = promisify(jwt.verify);

const { generateAccessToken, generateRefreshToken, generateResetPassword, generateVerifyToken } = require('../../utils/generateToken');
const { sendResetPassword, sendVerifyAccount } = require('../../services/sendingEmail');
const salt = 10;

class AuthController {
    // [POST] /api/auth/register
    async register(req, res) {
        try {
            const { username, email, password, confirmPassword, ...rest } = req.body;
            const exisingUser = await User.findOne({ 
                $or: [
                    { username }, 
                    { email } 
                ]
            });
            if (exisingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Tên đăng nhập & Email đã tồn tại, vui lòng nhập lại!',
                });
            };

            if (password !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Mật khẩu xác nhận không khớp!'
                });
            }

            // hash password
            const hashedPassword = await bcrypt.hash(password, salt);

            // Lưu người dùng vào database
            await User.create({
                username, 
                email,
                password: hashedPassword,
                ...rest,
                avatar: 'https://i0.wp.com/sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png?ssl=1' // avatar default
            });

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

    // [POST] /api/auth/register-owner
    async registerOwner(req, res) {
        try {
            const { name, username, email, password, phone, businessName } = req.body;
            const exisingOwner = await User.findOne({
                $or: [
                    { email: email },
                    { role: 'hotel_owner'}, 
                ]
            });

            if (exisingOwner) {
                return res.status(400).json({
                    success: false,
                    message: 'Email này đã được đăng kí làm đối tác. Vui lòng kiểm tra lại!',
                });
            }

            const newOwner = new User({
                name,
                username,
                email,
                role: 'hotel_owner',
                phone,
                isBusinessAccount: true,
                businessName,
            });

            const hashedPassword = await bcrypt.hash(password, salt);
            newOwner.password = hashedPassword;

            await newOwner.save();

            return res.status(200).json({
                success: true,
                message: 'Đăng kí làm đối tác thành công, quá trình xử lý có thể diễn ra trong 1 ngày!',
                newOwner
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

    // [POST] /api/auth/login
    async login(req, res) {
        try {
            const { username, password } = req.body;
            const user = await User.findOne({username, role: 'user'});
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

            const payload = {
                id: user._id,
                username: user.username,
                name: user.name,
                role: user.role,
                avatar: user.avatar
            }

            // Tạo accessToken cho user
            const accessToken = generateAccessToken(payload);

            // Tạo refreshToken cho user
            const refreshToken = generateRefreshToken(payload);

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
                user: { name: user.name, username: user.username, role: user.role, avatar: user.avatar, accessToken, refreshToken }
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

    // [POST] /api/auth/login-admin
    async loginAdmin(req, res) {
        try {
            const { username, password } = req.body;
            const user = await User.findOne({ username }).lean();

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Không tìm thấy quản trị viên!',
                });
            }

            if (user.role != 'admin') {
                return res.status(400).json({
                    success: false,
                    message: 'sai tên đăng nhập hoặc mật khẩu!',
                });
            }

            const passwordCorrect = await bcrypt.compare(password, user.password);
            if (!passwordCorrect) {
                return res.status(400).json({
                    success: false,
                    message: 'sai tên đăng nhập hoặc mật khẩu!',
                });
            }

            const payload = {
                user: user._id,
                role: user.role,
                avatar: user.avatar || 'https://i0.wp.com/sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png?ssl=1'
            };

            const accessToken = generateAccessToken(payload);
            const refreshToken = generateRefreshToken(payload);

            console.log(accessToken);
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
                user: { role: user.role, avatar: payload.avatar, accessToken, refreshToken }
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
                error: err.message
            });
        }
    }

    // [POST] /api/auth/login-hotel-owner
    async loginHotelOwner(req, res) {
        try {
            const { username, password } = req.body;
            const user = await User.findOne({ username }).lean();

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Không tìm thấy chủ khách sạn',
                });
            }

            if (user.role != 'hotel_owner') {
                return res.status(400).json({
                    success: false,
                    message: 'sai tên đăng nhập hoặc mật khẩu!',
                });
            }

            const passwordCorrect = await bcrypt.compare(password, user.password);
            if (!passwordCorrect) {
                return res.status(400).json({
                    success: false,
                    message: 'sai tên đăng nhập hoặc mật khẩu!',
                });
            }

            const payload = {
                user: user._id,
                role: user.role,
                avatar: user.avatar || 'https://i0.wp.com/sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png?ssl=1'
            };

            const accessToken = generateAccessToken(payload);
            const refreshToken = generateRefreshToken(payload);

            console.log(accessToken);
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
                user: { role: user.role, avatar: payload.avatar, accessToken, refreshToken }
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
                error: err.message
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
                return res.status(401).json({
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

            const resetLink = `http://localhost:5500/FE/Auth/reset-password.html?resetToken=${resetToken}`;

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

    // [POST] /api/auth/reset-password?resetToken={resetToken}
    async resetPassword(req, res) {
        try {
            const resetToken = req.query.resetToken;
            const { password, confirmPassword } = req.body;

            if (password !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Mật khẩu nhập lại không khớp!'
                });
            }

            let decoded;
            try {
                decoded = jwt.verify(resetToken, process.env.RESET_PASSWORD_SECRET);
            } catch (err) {
                console.log(err);
                return res.status(400).json({
                    success: false,
                    message: 'Thời gian đặt lại mật khẩu đã quá hạn. Vui lòng gửi lại yêu cầu!',
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
                        message: 'Không tìm thấy tài khoản!',
                    });
                }

                if (user.isVerify === true) {
                    return res.status(400).json({
                        success: false,
                        message: 'Tài khoản đã được xác thực!'
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

   // [GET] /api/auth/me
   async checkLogin(req, res) {
    try {
        const userData = req.user;
        
        if (!userData) return;

        const user = await User.findById(userData.id).lean();

        return res.status(200).json({
            success: true,
            user: {
                name: user.name,
                avatar: user.avatar,
                role: user.role
            }
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: 'Lỗi phía server',
            error: err.message
        });
    }
   }
    
}

module.exports = new AuthController();