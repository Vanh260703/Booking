const mongoose = require('mongoose');

const BookingSchema = mongoose.Schema(
    {
        bookingNumber: {type: String, required: true},
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        hotel: {type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true},
        room: {type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: true},
        checkInDate: {type: Date, required: true},
        checkOutDate: {type: Date, required: true},
        guests: {
            adults: {
                type: Number,
                required: true,
                min: 1,
            },
            children: {
                type: Number,
                default: 0,
                min: 0,
            },
        },
        guestDetails: {
            fullName: {type: String, required: true},
            gender: {type: String, enum: ['male', 'female'], required: true},
            email: {type: String, required: true},
            phone: {type: String, required: true},
        },
        pricing: {
            totalPrice:{type: Number, required: true},
            discount: {type: Number, default: 0},
            totalAmount: {type: Number, required: true},
        },
        payment: {type: mongoose.Schema.Types.ObjectId, ref: 'Payment'},
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'],
            default: 'pending',
        },
        notes: String,
        pointsCanClaim: Number,
    }, {
        timestamps: true,
    },
);

module.exports = mongoose.model('Booking', BookingSchema);