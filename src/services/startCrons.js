const cron = require('node-cron');
const Notification = require('../app/models/Notification');
const Booking = require('../app/models/Booking');

function checkInRemind() {
    cron.schedule('0 9 * * *', async () => {
        try {
            const now = new Date();
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const tomorrowStart = new Date(tomorrow.setHours(0, 0, 0, 0));
            const tomorrowEnd = new Date(tomorrow.setHours(23, 59, 59, 999));

            const bookings = await Booking.find({
                status: 'confirmed',
                startDate: { $gte: tomorrowStart, $lte: tomorrowEnd }
            }).populate('hotel user');

            for (const booking of bookings) {
                await Notification.create({
                    user: booking.user._id,
                    type: 'check_in_reminder',
                    title: 'Nhắc nhở check-in',
                    message: `Bạn có booking tại ${booking.hotel.name} vào ngày mai.`,
                });
            }

            console.log(`Đã gửi ${bookings.length} thông báo nhắc check-in.`);
        } catch (err) {
            console.error('Lỗi trong cron checkInRemind:', err);
        }
    }, {
        timezone: 'Asia/Ho_Chi_Minh'
    });
}

module.exports = { checkInRemind };