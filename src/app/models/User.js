const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    name: {type: String, required: true},
    username: {type: String},
    email: {type: String},
    password: {type: String},
    phone: {type: String},
    role: {type: String, enum: ['user', 'hotel_owner', 'admin'], default: 'user'},
    avatar: {url: String, publicId: String},
    gender: {type: String, enum: ['male', 'female', 'other']},
    passwordResetToken: String,
    passwordResetExpires: Date,
    isVerify: {type: Boolean, default: false},
    isCompleted: {type: Boolean, default: false},
    federated_credentials: [
        {
            provider: String,
            subject: String
        }
    ],
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);