const mongoose = require('mongoose');

const RoomInstanceSchema = mongoose.Schema({
    roomType: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    roomNumber: { type: Number, required: true },
    floor: { type: Number, required: true },
    status: {
        type: String,
        enum: ['available', 'booked', 'maintenance'],
        default: 'available',
    },
    isActive: { type: Boolean, default: true},
},  { timestamps: true });

module.exports = mongoose.model('RoomInstance', RoomInstanceSchema);