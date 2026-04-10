const mongoose = require('mongoose');

const NotificationSchema = mongoose.Schema(
    {
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        type: {type: String, enum: ['booking_confirmed', 'booking_cancelled', 'payment_success', 'payment_failed', 'check_in_reminder', 'review_reminder', 'promotion', 'system'], requried: true},
        title: {type: String, required: true},
        message: {type: String, required: true},
        link: {type: String},
        isRead: {type: Boolean, default: false},
    }, {
        timestamps: true
    }
);

module.exports = mongoose.model('Notification', NotificationSchema);

