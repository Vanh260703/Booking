const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');


class DashboardController {
    // [GET] /api/dashboard/admin
    async adminDashboard(req, res) {
        try {
            const admin = await User.findById(req.user.user);
            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy quản trị viên!',
                });
            }

            const userAccount = await User.countDocuments({ role: 'user'});
            const hotelOwnerAccount = await User.countDocuments({ role: 'hotel_owner' });

            console.log(userAccount);
            console.log(hotelOwnerAccount);
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

module.exports = new DashboardController();