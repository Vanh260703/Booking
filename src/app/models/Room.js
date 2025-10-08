const mongoose = require('mongoose');

const RoomSchema = mongoose.Schema(
    {
        hotel: {type: mongoose.Schema.Types.ObjectId, ref: 'Hotel'},
        name: {type: String, required: true}, // Tên phòng
        type: {type: String, enum: ['single', 'double', 'twin', 'triple', 'suite', 'deluxe', 'family', 'dormitory'], reuqired: true}, // Loại phòng
        // Ảnh phòng
        images: [{
            url: String,
            caption: String,
        }],
        number: {type: Number, required: true}, // Số phòng
        floor: {type: Number, required: true}, // Tầng
        size: {type: Number, min: 0, required: true}, // Diện tích
        // Loại giường
        bedType: {
            type: String,
            enum: ['single', 'double', 'queen', 'king', 'twin', 'bunk'],
            required: true,
        },
        // Số lượng giường
        numberOfBeds: {type: Number, min: 1, required: true},
        pricing: {
            // Giá cơ bản
            basePrice: {type: Number, min: 0, required: true},
            // Giá cuối tuần (nếu có)
            weekendPrice: {type: Number, min: 0},
            // Giá ngày lễ (nếu có)
            holidayPrice: Number,
        },

        // Tiện nghi
        amenities: [
            {
                type: String,
                enum: ['wifi', 'tv', 'air_conditioning', 'minibar', 'safe_box', 'phone', 'hairdryer', 'bathtub', 'shower', 
                    'balcony', 'sea_view', 'city_view', 'mountain_view', 'kitchen', 'coffee_maker', 'iron', 'workspace', 'soundproof',
                ],
            },
        ],
        // Tình trạng phòng (còn trống hay không)
        status: {
            type: String,
            enum: ['available', 'unavailable'],
            default: 'available'
        },
        // Giảm giá (tuỳ chọn)
        discount: [{
            name: String,
            percentage: {type: Number, min: 0, max: 100},
            startDate: Date,
            endDate: Date,
            isActive: {type: Boolean, default: true},
        }]
    }, {
        timestamps: true,
    }
);

module.exports = mongoose.model('Room', RoomSchema);
