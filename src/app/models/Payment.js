const mongoose = require('mongoose');

const PaymentSchema = mongoose.Schema({
    booking: {type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    amount: {type: Number, required: true},
    method: {type: String, enum: ['cash', 'vnpay', 'momo']},
    status: {type: String, enum: ['pending', 'proccess', 'completed', 'failed', 'refunded', 'cancelled'], default: 'pending'},
    transactionId: {type: String, unique: true},
    refund: {
        amount: String,
        reason: String,
        status: {type: String, enum: ['pending', 'processing', 'successed', 'failed']},
        refundedAt: Date,
    }
},{
    timestamps: true,
});

module.exports = mongoose.model('Payment', PaymentSchema);