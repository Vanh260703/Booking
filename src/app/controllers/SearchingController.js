const Hotel = require('../models/Hotel');
const City = require('../models/City');
const Booking =  require('../models/Booking');
const RoomType = require('../models/RoomType');

class SearchingController {
    // [GET] /api/searching
    async searching(req, res) {
        const cities = await City.find({ isPopular: true }).select('name slug images hotelCount image').lean();

        if (!cities) {
            return res.status(400).json({
                success: false,
                message: 'Lấy danh sách thành phố nổi bât thất bại!',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách thành phố nổi bât thành công!',
            cities,
        });
    }

    // [POST] /api/searching/
    async searchingDetail(req, res) {
        // Nên tối ưu sau khi đã test xong (.....)
        try {
            const { city, startDate, endDate, bookingInfo } = req.body;
            const hotels = await Hotel.find({ 'location.city': city }).lean();
            let hotelsAvailable = [];

            for (const hotel of hotels) {
                const roomTypes = await RoomType.find({ hotel: hotel._id }).lean();
                let hasAvailableRooms = false;
                for (const roomType of roomTypes ) {
                    const overlappingBookings = await Booking.countDocuments({
                        room: roomType.id,
                        checkInDate: { $lte: endDate },
                        checkOutDate: { $gte: startDate },
                        'guests.adults': { $gte: bookingInfo.adults },
                        'guests.children': { $gte: bookingInfo.children },
                    });

                    if (roomType.totalRooms - overlappingBookings - bookingInfo.totalRooms > 0) {
                        hasAvailableRooms = true;
                        break;
                    }
                }
                
                if (hasAvailableRooms) {
                    hotelsAvailable.pussh(hotel);
                }
            }

            return res.status(200).json({
                success: true,
                message: 'Tìm kiếm thành công!',
                data: hotelsAvailable,
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
}

module.exports = new SearchingController();