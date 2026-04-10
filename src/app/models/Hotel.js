const mongoose = require('mongoose');

const HotelSchema = mongoose.Schema(
    {
        owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        name: {type: String, required: true},
        slug: {type: String, required: true},
        description: {type: String, required: true},
        shortDescription: String,
        propertyType: {
            type: String, 
            enum: ['hotel', 'resort', 'apartment', 'villa', 'homestay', 'motel'],
            required: true,
        },
        images: [{
            title: String,
            url: String,
            category: {type: String, enum: ['exterior', 'lobby', 'room', 'bathroom', 'dining', 'pool', 'gym', 'other']}
        }],
        location: {
            city: {type: mongoose.Schema.Types.ObjectId, ref: 'City'},
            coordinates: {
                type: [Number], // [longitude, latitude]
                // required: true,
            },
            address: String,
        },
        contact: {
            hotline: String,
            website: String,
        },
        starRating: {
            type: Number, min: 1, max: 5
        },

        amenities: [{
            type: String,
            // enum: [
            //     'wifi', 'parking', 'pool', 'gym', 'spa', 'restaurant', 
            //     'bar', 'room_service', 'laundry', 'air_conditioning',
            //     'elevator', 'pet_friendly', 'wheelchair_accessible',
            //     'airport_shuttle', 'business_center', 'conference_room',
            //     '24h_reception', 'concierge', 'minibar', 'safe_box'
            // ]
        }],
        policies: {
            checkinTime: {type: String, default: '14:00'},
            checkoutTime: {type: String, default: '12:00'},
        },
        paymentMethod: {type: String, enum: ['cash', 'momo', 'vnpay']},
        averageRating: {type: Number, min: 0, max: 5, default: 0},
        totalReviews: {type: Number, default: 0},
        viewCount: {type: Number, default: 0},
        isFeatured: {type: Boolean, default: false},
        isApproved: {type: Boolean, default: false},
        status: {type: String, enum: ['pending', 'approve', 'denied'], default: 'pending'},
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Hotel', HotelSchema);