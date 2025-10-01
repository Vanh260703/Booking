const mongoose = require('mongoose');

const BookingSchema = mongoose.Schema(
    {
        bookingNumber: {type: String, unique: true, required: true},
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        hotel: {type: mongoose.Schema.Types.ObjectId, ref: 'Hotel'},
        room: {type: mongoose.Schema.Types.ObjectId, ref: 'Room'},
        roomNumber: String,
        checkInDate: {type: Date, required: true},
        checkOutDte: {type: Date, required: true},
        numberOfNights: {type: Number, required: true},
        guests: {
            adults: {
                type: Number,
                required: true,
                min: 1,
            },
            chilren: {
                type: Number,
                default: 0,
                min: 0,
            },
        },
        guestsDetail: {
            fullName: {type: String, required: true},
            email: {type: String, required: true},
            phone: {type: String, required: true},
            specialRequests: String,
        },
        pricing: {
            roomPrice: {type: Number, required: true},
            totalRoomPrice: Number, // roomPrice * numberOfNights
            discount: {type: Number, default: 0},
            totalAmount: {type: Number, required: true},
        },
        payment: {
            method: {type: String, enum: ['cash', 'momo', 'vnpay'], required: true},
            status: {type: String, enum: ['pending', 'paid', 'partially_paid', 'refunded', 'failed'], default: 'pending'},
            transactionId: String,
            paidAmount: {
                type: Number,
                default: 0,
            },
            paidAt: Date,
            refundAmount: {
                type: Number,
                default: 0,
            },
            refundAt: Date,
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'],
            default: 'pending',
        },
        cancellation: {
            cancelledAt: Date,
            cancelledBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
            reason: String,
            refundAmount: Number,
        },
        checkIn: {
            actualTime: Date,
            staff: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        },
        checkOut: {
            actualTime: Date,
            staff: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
        },
        notes: String,
    }, {
        timestamps: true,
    },
);

module.exports = mongoose.model('Booking', BookingSchema);