const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const slugify = require('slugify');


class HotelController {

    // [GET] /api/hotels
    async hotels(req, res) {
        try {
            const page = parseInt(req.query.page) || 1
            const limit = 5;
            const skip = (page - 1) * limit;
            const sortType = req.query.sort || 'defaut';
            const search = req.query.search || "";

            // Filter
            const filter = {
                name: { $regex: search, $options: 'i' }
            };

            // Sort 
            const sortOptions = {};
            if (sortType === 'price_asc') sortOptions.price = 1; 
            else if (sortType === 'price_desc') sortOptions.price = -1; 
            else if (sortType === 'rating_desc') sortOptions.price = -1; 
            else sortOptions.createdAt = -1;

            const hotels = await Hotel.find(filter)
                .sort(sortOptions)
                .skip(skip)  
                .limit(limit)      
                .lean();

            if (!hotels.length) {
                return res.status(401).json({
                    success: false,
                    message: 'Lấy danh sách khách sạn thất bại!',
                    hotels: [],
                });
            }

            const totalHotels = hotels.length;
            const totalPages = Math.ceil(totalHotels / limit);


            return res.status(200).json({
                success: true,
                message: 'Lấy danh sách khách sạn thành công!',
                hotels,
                pagination: {
                    totalHotels,
                    totalPages,
                    page
                },
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

    // [GET] /api/hotels/:id
    async detailsHotel(req, res) {
        try {
            const hotelID = req.params.id;
            const hotel = await Hotel.findById(hotelID).lean();

            if (!hotel) {
                return res.status(401).json({
                    success: false,
                    message: 'Lấy chi tiết khách sạn thất bại!',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Lấy chi tiết khách sạn thành công!',
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

    // [GET] /api/hotels/featured
    async featuredHotels(req, res) {
        try {
            const featuredHotels = await Hotel.find({ isFeatured: true }).lean();

            if (!featuredHotels.length) {
                return res.status(401).json({
                    success: false,
                    message: 'Lấy danh sách khách sạn nổi bật thất bại!',
                    featuredHotels: [],
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Lấy danh sách khách sạn nổi bật thành công!',
                featuredHotels,
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

    // [GET] /api/hotels/:id/available-rooms
    async availableRooms(req, res) {
        try {
            const hotelID = req.params.id;
            const rooms = await Room.find({ hotel: hotelID, status: 'available' }).lean();

            if (!rooms.length) {
                return res.status(401).json({
                    success: false,
                    message: 'Lấy danh sách phòng thất bại!',
                    rooms: [],
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Lấy danh sách phòng thành công!',
                rooms,
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

    // [POST] /api/hotels
    async createHotel(req, res) {
        try {
            const newHotel = new Hotel(req.body);
            const exisingHotel = await Hotel.findOne({ name: newHotel.name }).lean();

            if (exisingHotel) {
                return res.status(401).json({
                    success: false,
                    message: 'Khách sạn đã tồn tại. Vui lòng kiểm tra lại!',
                });
            }

            // Tạo slug
            const slug = slugify(newHotel.name, {
                replacement: '-',
                lower: true,
                locale: 'vi',
                strict: true,
            });

            return res.status(200).json({
                success: true,
                message: 'Tạo khách sạn thành công!',
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

module.exports = new HotelController();

