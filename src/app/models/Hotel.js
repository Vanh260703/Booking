const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    recipientName: String,
    addressLine: String,
    city: String,
    ward: String,
    shortAddress: String,
})

const HotelSchema = mongoose.Schema(
    {
        name: {type: String, required: true},
        slug: {type: String, required: true},
        description: {type: String, required: true},
        shortDescription: String,
        owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        images: {
            caption: String,
            urls: [{type: String}],
        },
        address: AddressSchema,
        contact: {
            phone: String,
            name: String,
        },
        starRating: {
            type: Number, min: 1, max: 5
        },
        amenities: [{
            type: String,
            enum: [
                'wifi', 'parking', 'pool', 'gym', 'spa', 'restaurant', 
                'bar', 'room_service', 'laundry', 'air_conditioning',
                'elevator', 'pet_friendly', 'wheelchair_accessible',
                'airport_shuttle', 'business_center', 'conference_room',
                '24h_reception', 'concierge', 'minibar', 'safe_box'
            ]
        }],
        policies: {
            checkinTime: {type: String, default: '14:00'},
            checkoutTime: {type: String, default: '12:00'},
        },
        paymentMethod: {type: String, enum: ['cash', 'momo', 'vnpay']},
        isVerified: {type: Boolean, default: false},
        averageRating: {type: Number, min: 0, max: 5, default: 0},
        totalReviews: {type: Number, default: 0},
        viewCount: {type: Number, default: 0},
        isFeatured: {type: Boolean, default: false},
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Hotel', HotelSchema);