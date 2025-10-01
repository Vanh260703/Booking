const mongoose = require('mongoose');

const ReviewSchema = mongoose.Schema(
    {
        booking: {type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true},
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        hotel: {type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true},
        room: {type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true},
        ratings: {
            rating: {type: Number, min: 1, max: 5, required: true},
            comment: {type: String, required: true},
            images: [{
                url: String,
                caption: String,
            }]
        }
    }, {
        timestamps: true,
    }
)

module.exports = mongoose.model('Review', ReviewSchema);