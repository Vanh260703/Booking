const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const City = require('../models/City');
const Room = require('../models/RoomType');
const slugify = require('slugify');
const { fetchLocationData } = require('../../services/processingLocation');
const { sendNotificationApproveHotel } = require('../../services/sendingEmail');

class HotelController {

    // [GET] /api/hotels/:city
    async hotels(req, res) {
        try {
            const citySlug =  req.params.city;
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

    // [GET] /api/hotels/:hotelId
    async detailsHotel(req, res) {
        try {
            const hotelID = req.params.hotelId;
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
                hotel,
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

    // [GET] /api/hotels/recommended
    async recommendHotel(req, res) {
        try {
            const hotelsRecommend = await Hotel.find({
                averageRating: { $gt: 4.5 },
                viewCount: { $gt: 1000}
            })
            .select('averageRating viewCount')
            .sort({ averageRating: -1, viewCount: -1})
            .limit(5)
            .lean();

            if (!hotelsRecommend.length) {
                return res.status(200).json({
                    success: true,
                    message: 'Không tìm thấy khách sạn nào phù hợp!',
                    hotels: [],
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Lấy danh sách khách sạn gợi ý thành công!',
                hotels: hotelsRecommend
            });

        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
                error: err.message
            });
        }
    }

    // [GET] /api/hotels/:hotelId/rooms 
    async getRoomsByHotel(req, res) {
        try {
            const hotelId = req.params.hotelId;
            const rooms = await Room.find({ hotel: hotelId }).lean();
        
            if (!rooms.length) {
                return res.status(200).json({
                    success: true,
                    message: 'Không tìm thấy phòng nào trong khách sạn!',
                    rooms: [],
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Lấy danh sách phòng thành công!',
                rooms
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

    // [GET] /api/hotels/:hotelId/bookings (OWNER)
    async getAllBookingsInHotel (req, res) {
        try {
            const hotelId = req.params.hotelId;
            const owner = req.user;

            if (!owner.hotels_owner.includes(hotelId)) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không đủ điều kiện để truy cập!'
                });
            }
            
            const bookings = await Booking.find({ hotel: hotelId }).lean();

            if (!bookings.length) {
                return res.status(200).json({
                    success: true,
                    message: 'Khách sạn chưa có booking nào!',
                    bookings: [],
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Lấy danh sách booking thành công!',
                bookings
            });
        } catch (err) {
            console.log(err);
            return res.stauts(500).json({
                success: false,
                message: 'Lỗi phía server!',
                error: err.message
            });
        }
    }

    // [POST] /api/hotels (OWNER)
    async createHotel(req, res) {
        try {
            const owner = req.user;
            const { name, description, propertyType, cityName } = req.body;
            const slugCity = slugify(cityName, {
                replacement: '-',
                lower: true,
                locale: 'vi',
                strict: true,
            });
            const city = await City.findOne({ slug: slugCity });
            
            if (!city) {
                return res.status(400).json({
                    success: false,
                    message: 'Không tìm thấy thành phố!',
                });
            }

            const exisingHotel = await Hotel.findOne({ name }).lean();

            if (exisingHotel) {
                return res.status(401).json({
                    success: false,
                    message: 'Khách sạn đã tồn tại. Vui lòng kiểm tra lại!',
                });
            }

            // Tạo slug
            const slug = slugify(name, {
                replacement: '-',
                lower: true,
                locale: 'vi',
                strict: true,
            });

            const locationData = await fetchLocationData(name);

            const newHotel = new Hotel({
                owner: owner.id,
                name,
                description,
                slug,
                propertyType,
                images: locationData.images,
                location: {
                    city: city._id,
                    coordinates: locationData.coordinates,
                    address: locationData.address,
                },
                contact: locationData.contact,
                amenities: locationData.amenities,
                totalReviews: locationData.reviews,
                starRating: locationData.rating,
            })

            await newHotel.save();

            // Cập nhập số lượng hotel trong city
            city.hotelCount++;
            await city.save();

            return res.status(200).json({
                success: true,
                message: 'Đăng kí khách sạn thành công! Vui lòng đợi xác thực!',
                newHotel
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

    // [PUT] /api/hotels/:hotelId (OWNER)
    async updateHotel(req, res) {
        try {
            const updateFields = req.body;
            const hotelID = req.params.hotelId;
            const hotel = await Hotel.findById(hotelID).select('description images contact policies');

            if (!hotel) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy khách sạn!',
                });
            }

            Object.assign(hotel, updateFields);

            await hotel.save();

            return res.status(200).json({
                success: true,
                message: 'Cập nhật thông tin khách sạn thành công!',
                hotel
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

    // [PATCH] /api/hotels/:hotelId/approve (ADMIN)
    async approveHotel(req, res) {
        try {
            const hotelID = req.params.hotelId;
            const hotel = await Hotel.findById(hotelID).select('status isApproved owner');

            if (!hotel) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy khách sạn!',
                });
            }

            hotel.isApproved = true;
            hotel.status = 'approve';

            const user = await User.findById(hotel.owner).select('email').lean();
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy người dùng!',
                });
            }

            const sendEmail = await sendNotificationApproveHotel(user.email);
            sendEmail ? console.log('Gửi mail thành công!') : console.log('Gửi mail thất bại!');

            await hotel.save();

            return res.status(200).json({
                success: true,
                message: 'Chấp thuận khách sạn thành công!',
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
                error: err.message
            });
        }
    }

    // [PATCH] /api/hotels/:hotelId/reject (ADMIN)
    async rejectHotel(req, res) {
        try {
            const hotelID = req.params.hotelId;
            const hotel = await Hotel.findById(hotelID).select('status isApproved');

            if (!hotel) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy khách sạn!',
                });
            }

            hotel.status = 'denied';

            const user = await User.findById(hotel.createdBy).select('email').lean();
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy người dùng!',
                });
            }

            const sendEmail = await sendNotificationApproveHotel(user.email);
            sendEmail ? console.log('Gửi mail thành công!') : console.log('Gửi mail thất bại!');


            await hotel.save();

            return res.status(200).json({
                success: true,
                message: 'Từ chối khách sạn thành công!',
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

    // [GET] /api/hotels/ (ADMIN)
    async getAllHotels (req, res) {
        try {
            const hotels = await Hotel.find({}).lean();
            if (!hotels.length) {
                return res.status(200).json({
                    success: true,
                    message: 'Chưa có khách sạn nào được đăng kí!',
                    hotels: []
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Lấy danh sách tất cả khách sạn thành công!',
                hotels
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

