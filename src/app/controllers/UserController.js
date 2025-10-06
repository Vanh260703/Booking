const User = require('../models/User');
const { sendNotificationChangePassword } = require('../../services/sendingEmail');
const moment = require('moment');
const bcrypt = require('bcrypt');
const salt = 10;

class UserController {
    // [GET] /api/users/profile
    async profile(req, res) {
        try {
            const userData = req.user;
            const user = await User.findById(userData.id).select('name username email phone gender isVerify avatar').lean();
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Không tìm thấy người dùng',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Lấy thông tin người dùng thành công!',
                user,
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

    // [PUT] /api/users/profile
    async updateProfile(req, res) {
        try {
            const userData = req.user;
            const user = await User.findById(userData.id).select('name email phone gender avatar');
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Không tìm thấy người dùng'
                })
            }

            Object.assign(user, req.body);
            await user.save();
            
            return res.status(200).json({
                success: true,
                message: 'Cập nhật thông tin người dùng thành công!',
                user,
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

    // [PATCH] /api/users/change-password
    async changePassword(req, res) {    
        try {
            const userData = req.user;
            const { newPassword, confirmedPassword } = req.body;
            const now = moment(Date.now()).format('HH:ss DD-MM-YYYY');
            const user = await User.findById(userData.id).select('password email');

            if (newPassword !== confirmedPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Mật khẩu không khớp. Vui lòng kiểm tra lại!',
                });
            }
            const isMatched = await bcrypt.compare(newPassword, user.password);

            if (isMatched) {
                return res.status(401).json({
                    success: false,
                    message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại!',
                });
            }

            const hashedNewPassword = await bcrypt.hash(newPassword, salt);
            user.password = hashedNewPassword;

            await user.save();

            const recoverLink = `http://localhost:3000/api/auth/forgot-password`;

            const sendEmail = await sendNotificationChangePassword(user.email, now, recoverLink);
            sendEmail ? console.log('✅ Gửi mail thành công!') : console.log('❌ Gửi mail thất bại');

            return res.status(200).json({
                success: true,
                message: 'cập nhật mật khẩu thành công!',
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

    // [DELETE] /api/users/account 
    async deleteAccount(req, res) {
        try {
            const userData = req.user;
            const userDeleted  = await User.deleteOne({ _id: userData.id });
            if (!userDeleted) {
                return res.status(401).json({
                    success: false,
                    message: 'Có lỗi khi xoá người dùng!',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Xoá người dùng thành công!',
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

    // [GET] /api/users/:id 
    async detailsUser(req, res) {
        try {
            const userID = req.params.id;
            const user = await User.findById(userID).select('name username email role gender phone isVerify federated_credentials').lean();

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Không tìm thấy người dùng!',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Lấy thông tin người dùng thành công!',
                user,
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

    // [GET] /api/users
    async users(req, res) {
        try {
            const users = await User.find({role: 'user'}).select('name username email role gender phone isVerify federated_credentials').lean();
            if (!users) {
                return res.status(401).json({
                    success: false,
                    message: 'Lấy danh sách người dùng thất bại!',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Lấy danh sách nguời dùng thành công!',
                users,
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

    // [PATCH] /api/users/:id/role
    async updateRole(req, res) {
        try {
            const userID = req.params.id;
            const user = await User.findById(userID).select('role');
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Không tìm thấy người dùng!',
                });
            }

            user.role = 'hotel_owner';

            await user.save();

            return res.status(200).json({
                success: true,
                message: 'Cập nhật role thành công!',
                user,
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

    
}

module.exports = new UserController();