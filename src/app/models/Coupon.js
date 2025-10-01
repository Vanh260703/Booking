const mongoose = require('mongoose');

const CouponSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    description: true,
    type: {
        type: String,
        enum: ['percentage', 'fixed_amount'],
        required: true,
    },
    value: {
        type: Number,
        requried: true,
    },
    usageLimit: {
        type: Number,
        default: null,
    },
    usedCount: {
        type: Number,
        default: 0,
    },
    userLimit: {
        type: Number,
        default: 1,
    },
    usedBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        usedAt: Date,
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
        }
    }],
    isActive: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('Coupon', CouponSchema);