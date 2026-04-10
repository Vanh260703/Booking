const Hotel = require('../models/Hotel');
const RoomType = require('../models/RoomType');
const RoomInstance = require('../models/RoomInstance');
const Booking = require('../models/Booking');
const { generateRoomInstance } = require('../../utils/generateRoomInstance');

class RoomController {

    // [GET] /api/rooms/
    async getAllRooms (req, res) {
        try {
            const roomTypes = await RoomType.find({}).lean();

            if (!roomTypes.length) {
                return res.status(200).json({
                    success: true,
                    message: 'Danh sách phòng đang trống!',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Lấy danh sách phòng thành công!',
                roomTypes
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
                error: err.message,
            });
        }
    }

    // [GET] /api/rooms/:roomId
    async detailsRoom (req, res) {
        try {
            const roomId  = req.params.roomId;
            const room = await RoomType.findById(roomId).lean();

            if (!room) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy phòng!',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Lấy thông tin phòng thành công!',
                room
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
                error: err.message,
            });
        }
    }

    // [GET] /api/rooms/:roomdId/availability
    async getAvailability (req, res) {
        try {
            const roomId = req.params.roomId;
            const { checkIn, checkOut } = req.query;
            const roomType = await RoomType.findById(roomId);

            if (!roomType) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy loại phòng!',
                });
            }

            if (new Date(b) - new Date(a)) {
                return res.status(400).json({
                    success: false,
                    message: 'Ngày kết thúc không được nhỏ hơn ngày bắt đầu!'
                });
            }

            const overlappingBookings = await Booking.countDocuments({
                room: roomId,
                status: { $in: ['confirmed', 'checked_in']},
                checkInDate: { $lte: checkOut },
                checkOutDate: { $gte: checkIn }
            });


            const availableRooms = roomType.totalRooms - overlappingBookings;

            if (availableRooms > 0) {
                return res.status(200).json({
                    success: true,
                    message: `Còn ${availableRooms} có thể đặt!`,
                    roomType,
                });
            } else {
                return res.status(200).json({
                    success: true,
                    message: 'Hiện tại đã hết kiểu phòng này. Xin lỗi vì sự bất tiện!',
                });
            }

        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
                error: err.message
            });
        }
    }

    // [POST] /api/rooms?hotel=hotelId (OWNER)
    async createRoom (req, res) {
        try {
            const owner = req.user;
            const hotel = req.query.hotelId;
            const { name, totalRooms, ...rest } = req.body;

            const exisingRoom = await RoomType.findOne({ name }).lean();

            if (exisingRoom) {
                return res.status(400).json({
                    success: false,
                    message: 'Phòng đã tồn tại!',
                });
            }

            if (!owner.hotels_owner.includes(hotel)) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không đủ điều kiện truy cập!'
                });
            }



            const newRoomType = new RoomType({
                name,
                totalRooms,
                availableRooms: totalRooms,
                hotel,
                ...rest,
            });

            // Lưu loại phòng
            await newRoomType.save();

            // Sinh các phòng chi tiết
            await generateRoomInstance(newRoomType);

            console.log(`Khởi tạo thành công ${newRoomType.totalRooms} phòng thuộc loại ${newRoomType.name}!`);

            return res.status(200).json({
                success: true,
                message: 'Tạo phòng thành công!',
                newRoomType
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
                error: err.message,
            });
        }
    }

    // [PUT] /api/rooms/room-types/:roomId (OWNER)
    async updateRoom (req, res) {
        try {
            const updateFields = req.body;
            const roomId = req.params.roomId;
            const roomType = await RoomType.findById(roomId);

            if (!roomType) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy kết quả!',
                });
            }

            Object.assign(roomType, updateFields);
            await roomType.save();

            return res.status(200).json({
                success: true,
                message: 'Cập nhật thông tin phòng thành công!',
                roomType
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
                error: err.message,
            });
        }
    }

    // [DELETE] /api/rooms/room-types/:roomId (OWNER)
    async deleteRoomType (req, res) {
        try {
            const roomId = req.params.roomId;
            const roomType = await RoomType.findById(roomId);

            if (!roomType) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy loại phòng!',
                });
            }

            if (!roomType.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'Loại phòng đã bị vô hiệu hoá rồi!'
                })
            }

            // Soft Delete
            roomType.isActive = false;
            await roomType.save();

            await RoomInstance.updateMany({ roomType: roomId }, { isActive: false });

            return res.status(200).json({
                success: true,
                message: 'Đã vô hiệu hoá loại phòng và các phòng liên quan!',
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
                error: err.message,
            });
        }
    }

    // [DELETE] /api/rooms/:roomId (OWNER)
    async deleteRoomInstance (req, res) {
        try {
            const roomId = req.params.roomId;
            const roomInstance = await RoomInstance.findById(roomId);

            if (!roomInstance) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy phòng!',
                });
            }

            // Soft Delete
            roomInstance.isActive = false;
            await roomInstance.save();

            return res.status(200).json({
                success: true,
                message: 'Đã xoá phòng thành công!',
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
                error: err.message,
            });
        }
    }

    // [PATCH] /api/rooms/:roomId/status (OWNER)
    async updateRoomStatus (req, res) {
        try {
            const { status } = req.body;
            const roomId = req.params.roomId;
            const roomInstance = await RoomInstance.findById(roomId).select('status');

            if (!roomInstance) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy phòng!',
                });
            }

            roomInstance.status = status;
            await roomInstance.save();

            return res.status(200).json({
                success: true,
                message: 'Cập nhật trạng thái phòng thành công!',
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
                error: err.mesasge,
            });
        }
    }

    // [PATCH] /api/rooms/:roomdId/pricing (OWNER)
    async updateRoomPricing (req, res) {
        try {
            const newPricing = req.body;
            const roomId = req.params.roomId;
            const roomType = await RoomType.findById(roomId).select('pricing');

            if (!roomType) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy phòng!',
                });
            }

            Object.assign(roomType.pricing, newPricing);
            await roomType.save();

            return res.status(200).json({
                success: true,
                message: 'Cập nhật trạng thái phòng thành công!',
                roomType,
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
                error: err.message,
            });
        }
    }

    // [GET] /api/rooms/:roomId/bookings (OWNER)
    async getRoomBookings (req, res) {
        try {
            const roomType = req.params.roomId;
            const bookings = await Booking.find({ room: roomType }).lean();
            
            if (!bookings.length) {
                return res.status(200).json({
                    success: true,
                    message: 'Chưa có booking nào cho kiểu phòng này!',
                    bookings: []
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Lấy danh sách booking của loại phòng thành công!',
                bookings,
            })
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
                error: err.message
            });
        }
    }
    
}

module.exports = new RoomController();