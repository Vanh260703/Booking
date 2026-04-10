const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationController {
    // [PATCH] /api/notifications/:id/read
    async markAsRead (req, res) {
        try {
            const notificationId = req.params.id;
            const notification = await Notification.findById(notificationId).select('isRead');

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message: 'Thông báo không tồn tại!',
                });
            }

            if (notification.isRead === true) {
                return res.status(400).json({
                    success: false,
                    message: 'Thông báo này đã được đánh dấu là đọc rồi!',
                });
            }

            notification.isRead = true;
            await notification.save();

            return res.status(200).json({
                success: true,
                message: 'Đánh dấu đã đọc!',
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
                error: err.message
            })
        }
    }

    // [PATCH] /api/notifications/read-all
    async markAllAsRead (req, res) {
        try {
            const user = req.user;
            const result = await Notification.updateMany(
                { user: user.id, isRead: false },
                { isRead: true},
            );

            return res.status(200).json({
                success: true,
                message: 'Đã đánh dấu đọc tất cả!',
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
                error: err.message
            })
        }
    }

    // [DELETE] /api/notifications/:id
    async deleteNotification (req, res) {
        try {
            const notificationId = req.params.id;
            const result = await Notification.deleteOne({ _id: notificationId });

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Thông báo không tồn tại!',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Xoá thông báo thành công!',
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

    // [DELETE] /api/notifications/
    async deleteAllNotification (req, res) {
        try {
            const user = req.user;
            const result = await Notification.deleteMany({ user: user.id });

            return res.status(200).json({
                success: true,
                message: `Xoá thành công ${result.deleteCount} thông báo!`
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

    // [POST] /api/notifications (ADMIN)
    async sendNotification (req, res) {
        try {
            const { userId, type, ...rest } = req.body;
            const existingNotification = Notification.findOne({
                user: userId,
                type,
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)}
            });

            if (existingNotification) {
                return res.status(400).json({
                    success: false,
                    message: 'Thông báo đã được gửi đén người dùng trước đó rồi!',
                });
            }

            const notification = await Notification.create({
                userId,
                type,
                ...rest
            });

            return res.status(200).json({
                success: true,
                message: 'Gửi thông báo thành công!',
                notification
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

    // [POST] /api/notifications/broadcast (ADMIN)
    async broadcastNotification (req, res) {
        try {
            const { type, title, message, link } = req.body;
            
            if (!message || !title) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin!',
                });
            }

            const users = await User.find({ role: 'user' }).select('_id').lean()

            if (!users.length) {
                return res.status(200).json({
                    success: true,
                    message: 'Không có người dùng nào để gửi!',
                });
            }

            const notifications = users.map(u => ({
                user: u._id,
                type: type || 'system',
                title,
                message,
                link
            }));

            await Notification.insertMany(notifications);

            return res.status(200).json({
                success: true,
                message: 'Gửi thông báo cho tất cả người dùng thành công!',
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

module.exports = new NotificationController();