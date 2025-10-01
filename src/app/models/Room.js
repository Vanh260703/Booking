const mongoose = require('mongoose');

const RoomSchema = mongoose.Schema(
    {
        hotel: {type: mongoose.Schema.Types.ObjectId, ref: 'Hotel'},
        name: {type: String, required: true},
        type: {type: String, enum: ['single', 'double', 'twin', 'triple', 'suite', 'deluxe', 'family', 'dormitory'], reuqired: true},
        images: [{
            url: String,
            caption: String,
        }],
        size: {type: Number, required: true},
        bedType: {type: String, enum: ['single', 'double', 'queen', 'king', 'twin', 'bunk'], required: true},
        numberOfBeds: {type: Number, min: 1, required: true},
        basePrice: {type: Number, min: 0},
        weekendPrice: Number,
        amenities: [{
            type: String,
            enum: [
            'wifi', 'tv', 'air_conditioning', 'minibar', 'safe_box',
            'phone', 'hairdryer', 'bathtub', 'shower', 'balcony',
            'sea_view', 'city_view', 'mountain_view', 'kitchen',
            'coffee_maker', 'iron', 'workspace', 'soundproof'
            ]
        }],
        totalRooms: {type: Number, default: 1},
        roomNumbers: [{
            number: String,
            floor: Number,
            status: {
                type: String,
                enum: ['available', 'unavailable'],
                default: 'available',
            }
        }],
        discounts: [{
            name: String,
            percentage: Number,
            startDate: Date,
            endDate: Date,
            isActive: Boolean,
        }]
    }, {
        timestamps: true,
    }
);

module.exports = mongoose.model('Room', RoomSchema);
