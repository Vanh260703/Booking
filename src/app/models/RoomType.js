const mongoose = require('mongoose');

const RoomTypeSchema = mongoose.Schema(
    {
        hotel: {type: mongoose.Schema.Types.ObjectId, ref: 'Hotel'},
        name: {type: String, required: true}, // Tên phòng
        type: {type: String, enum: ['single', 'double', 'twin', 'triple', 'suite', 'deluxe', 'family', 'dormitory'], reuqired: true}, // Loại phòng
        description: String,
        // Ảnh phòng
        images: [{
            url: String,
            caption: String,
        }],
        size: {type: Number, min: 0, required: true}, // Diện tích
        // Cấu hình giường
        bedConfiguration: [{
            type: {
                type: String,
                enum: ['single', 'double', 'queen', 'king', 'twin', 'bunk'],
                required: true,
            },
            quantity: {
                type: Number,
                min: 1,
                required: true,
            }
        }],
        // Sức chứa
        maxOccupancy: {
            adults: {
                type: Number,
                min: 1,
                required: true,
            },
            children: {
                type: Number,
                min: 0,
                default: 0,
            },
        },
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
        // Tổng số phòng
        totalRooms: { type: Number, default: 1, required: true},
        availableRoom: {type: Number, default: 1, required: true},
        // Tình trạng phòng (còn trống hay không)
        isActive: {type: Boolean, default: false},
        // Chính sách phòng
        policies: {
            checkInTime: {
                type: String,
                default: '14:00'
            },
            checkOutTime: {
                type: String,
                default: '12:00'
            },
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

module.exports = mongoose.model('RoomType', RoomTypeSchema);
