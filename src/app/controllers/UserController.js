const User = require('../models/User');
const Booking = require('../models/Booking');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const { sendNotificationChangePassword, sendNotificationApproveOwner } = require('../../services/sendingEmail');
const moment = require('moment');
const bcrypt = require('bcrypt');
const salt = 10;

class UserController {
    // [GET] /api/users/me/profile
    async profile (req, res) {
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
                role: userData.role
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

    // [PUT] /api/users/me/profile
    async updateProfile (req, res) {
        try {
            const userData = req.user;
            const { name, phone, gender } = req.body;
            const regexOnlyNumbers = /^\d+$/;
            const user = await User.findById(userData.id).select('name email phone gender avatar');
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Không tìm thấy người dùng'
                })
            }

            if (phone.length != 10) {
                return res.status(400).json({
                    success: false,
                    message: 'Số điện thoại không hợp lệ'
                })
            }

            if (!regexOnlyNumbers.test(phone)) {
                return res.status(400).json({
                    success: false,
                    message: 'Số điện thoại không hợp lệ'
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

    // [PATCH] /api/users/me/change-password
    async changePassword(req, res) {    
        try {
            const userData = req.user;
            const { password, newPassword, confirmedPassword } = req.body;
            const now = moment(Date.now()).format('HH:ss DD-MM-YYYY');
            const user = await User.findById(userData.id).select('password email');

            const checkOldPassword = await bcrypt.compare(password, user.password);
            if (!checkOldPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Mật khẩu hiện tại không đúng!'
                });
            }

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

    // [GET] /api/users/me/bookings
    async getAllBookings (req, res) {
        try {
            const user = req.user;
            const bookings = await Booking.find({ user: user.id }).lean();
            
            if (!bookings.length) {
                return res.status(200).json({
                    success: true,
                    message: 'Bạn chưa có booking nào!',
                    bookings: []
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Lấy danh sách bookings thành công!',
                bookings
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
            });
        }
    }

    // [GET] /api/users/me/coupons
    async getAllCoupons (req, res) {
        try {
            const user = await User.findById(req.user.id).lean();

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy người dùng!',
                });
            }

            if (!user.redemmedCoupons.length) {
                return res.status(200).json({
                    success: true,
                    message: 'Bạn chưa có voucher nào',
                    vouchers: [],
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Lấy danh sách voucher thành công!',
                vouchers: user.redemmedCoupons
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server'
            });
        }
    }

    // [GET] /api/users/me/points
    async checkPoints (req, res) {
        try {
            const user = await User.findById(req.user.id).lean();

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy người dùng!',
                });
            }

            if (user.points <= 0) {
                return res.status(200).json({
                    success: true,
                    message: 'Quý khách chưa có điểm khả dụng!',
                    points: 0,
                });
            }

            const bookings = await Booking.find({ user: req.user.id }).lean();

            return res.status(200).json({
                success: true,
                message: 'Xem số điểm thành công!',
                points: user.points,
                bookings,
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

    // [GET] /api/users/me/reviews
    async myReviews (req, res) {
        try {
            const user = req.user;
            const reviews = await Review.find({ user: user.id }).lean();

            return res.status(200).json({
                success: true,
                message: reviews.length > 0 ? 'Lấy danh sách reviews thành công!' : 'Bạn chưa có đánh giá nào!',
                reviews
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

    // [GET] /api/users/me/reviews-pending
    async pendingReviews (req, res) {
        try {
            const bookings = await Booking.find({ user: req.user.id }).lean();

            if (!bookings.length) {
                return res.status(200).json({
                    success: true,
                    message: 'Bạn chưa có booking nào!',
                });
            }

            const reviews = await Review.find({ user: req.user.id }).lean();
            const reviewsId = reviews.map(review => review.booking.toString());
            const pendingReviews = bookings.filter((booking) => !reviewsId.includes(booking._id.toString()));

            return res.status(200).json({
                success: true,
                message: pendingReviews.length > 0 ? 'Lấy danh sách booking đang đợi review thành công' : 'Không có booking nào đang đợi review!',
                pendingReviews
            })
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server', 
                error: err.message
            });
        }
    }

    // [GET] /api/users/me/notifications
    async myNotifications (req, res) {
        try {
            const user = req.user;
            const notifications = await Notification.find({ user: user.id }).lean();

            return res.status(200).json({
                success: true,
                message: notifications.length > 0 ? 'Lấy danh sách thông báo thành công!' : 'Chưa có thông báo nào!',
                notifications
            })
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
                error: err.message
            });
        }
    }

    // [GET] /api/users (ADMIN)
    async users (req, res) {
        try {
            const { role } = req.query;
            const dataConvert = {
                user: 'người dùng',
                hotel_owner: 'đối tác'
            }
            
            const users = await User.find({ role }).select('name username email role gender phone isVerify federated_credentials').lean();
            if (!users.length) {
                return res.status(401).json({
                    success: false,
                    message: 'Lấy danh sách người dùng thất bại!',
                });
            }

            return res.status(200).json({
                success: true,
                message: `Lấy danh sách ${dataConvert[role]} thành công!`,
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

    // [GET] /api/users/pending-owners (ADMIN)
    async pendingOwners (req, res) {
        try {
            const pendingOwners = await User.find({ role: 'hotel_owner', status: 'pending' }).select('name email phone isCompleted status').lean();

            if (!pendingOwners.length) {
                return res.status(200).json({
                    success: true,
                    message: 'Không có chủ khách sạn nào đang chờ duyệt!',
                    owners: [],
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Lấy danh sách thành công!',
                owners: pendingOwners,
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

    // [DELETE] /api/users/:id (ADMIN)
    async deleteAccount (req, res) {
        try {
            const userID = req.params.id;
            const user = await User.findByIdAndDelete(userID).lean();

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Không tìm thấy người dùng!',
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

    // [GET] /api/users/:id (ADMIN)
    async detailsUser (req, res) {
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

    // [PATCH] /api/users/:id/approve-owner (ADMIN)
    async approveOwner (req, res) {
        try {
            const ownerID = req.params.id;
            const owner = await User.findById(ownerID).select('status email');

            if (!owner) {
                return res.status(400).json({
                    success: false,
                    message: 'Không tìm thấy đối tác',
                });
            }

            owner.status = 'active';

            const ownerPage = `http://local:3000/`

            await sendNotificationApproveOwner(owner.email, ownerPage)

            await owner.save();

            return res.status(200).json({
                success: true,
                message: 'Xác thực đối tác thành công!',
                owner
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