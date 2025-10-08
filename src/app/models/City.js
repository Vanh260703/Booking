const mongoose = require('mongoose');

const CitySchema = mongoose.Schema({
    name: {type: String, required: true},
    nameEn: {type: String, trim: true},
    slug: {type: String, required: true},
    description: String,
    images: [{
        url: String,
        caption: String,
    }],
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
        }
    },
    isPopular: {type: Boolean, default: false},
    hotelCount: {type: Number, min: 0, default: 0},
    displayOrder: {type: Number, default: 0},
}, { timestamps: true });

module.exports = mongoose.model('City', CitySchema);