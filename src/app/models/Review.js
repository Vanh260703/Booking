const mongoose = require('mongoose');

const ReviewSchema = mongoose.Schema(
    {
        booking: {type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true},
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        hotel: {type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true},
        ratings: {
            star: {type: Number, min: 1, max: 5, required: true},
            comment: {type: String, required: true},
            images: [{
                original: String,
                thumbnail: String,
                caption: String,
            }]
        },
        helpfulCount: {type: Number, min: 0, default: 0},
        isFixed: {type: Boolean, default: false},
    }, {
        timestamps: true,
    }
)

module.exports = mongoose.model('Review', ReviewSchema);