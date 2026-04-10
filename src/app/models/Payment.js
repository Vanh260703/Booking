const mongoose = require('mongoose');

const PaymentSchema = mongoose.Schema({
    bookingNumber: {type: String, required: true},
    amount: {type: Number, required: true},
    method: {type: String, enum: ['vnpay', 'momo']},
    status: {type: String, enum: ['pending', 'proccess', 'completed', 'failed', 'refunded', 'cancelled'], default: 'pending'},
    transactionId: {type: String},
    transactionDate: {type: String},
    paidAt: Date,
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