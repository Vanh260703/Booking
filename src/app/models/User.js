const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    name: {type: String, required: true},
    username: {type: String},
    email: {type: String},
    password: {type: String},
    phone: {type: String},
    role: {type: String, enum: ['user', 'hotel_owner', 'admin'], default: 'user'},
    avatar: {type: String},
    gender: {type: String, enum: ['male', 'female', 'other']},
    passwordResetToken: String,
    passwordResetExpires: Date,
    isVerify: {type: Boolean, default: false},
    status: {
        type: String,
        enum: ['pending', 'active'],
        default: 'pending',
    },
    isBusinessAccount: {type: Boolean, default: false},
    businessName: String,
    isCompleted: {type: Boolean, default: false},
    federated_credentials: [
        {
            provider: String,
            subject: String
        }
    ],
    points: { type: Number, min: 0, default: 0 },
    redemmedCoupons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' }],
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);