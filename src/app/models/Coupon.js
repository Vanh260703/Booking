const mongoose = require('mongoose');

const CouponSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['percent', 'fixed_amount'],
        required: true,
    },
    value: {
        type: Number,
        requried: true,
    },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', default: null }, // Nếu hotel = null thì là voucher của hệ thống
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdByRole: { type: String, enum: ['admin', 'hotel_owner'], required: true },
    startDate: Date,
    endDate: Date,
    minAmount: { type: Number, default: 0 },
    maxAmount: { type: Number, default: 0},
    maxUsage: { type: Number, default: 1000 },
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
    isRedeemable: { type: Boolean, default: false}, // Coupon có thể đổi được bằng điểm
    requiredPoints: {type: Number, default: 0},
    isActive: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('Coupon', CouponSchema);