const Hotel = require('../models/Hotel');
const RoomType = require('../models/RoomType');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const User = require('../models/User');
const Notification = require('../models/Notification');
const generateBookingCode = require('../../utils/generateBookingCode');
const moment = require('moment');
const { sendNotificationSuccessBooking } = require('../../services/sendingEmail');
const { createMomoPayment, queryMomoTransaction, refundMomoPayment, saveRefundMomo } = require('../../services/momoPayment');
const { createVnpayPayment, handleVnpayReturn, queryVnpayTransaction, refundVnpayPayment, saveRefundVnpay } = require('../../services/vnpayPayment');
const totalRoomPrice = require('../../utils/totalRoomPrice');
const { cutFileInMinio } = require('../../services/minioService');
const { hanldeFinalUpload } = require('../../services/handlerUploadImage');
class BookingController {
    // [POST] api/bookings/
    async createBooking (req, res) {
        try {
            const roomType = await RoomType.findById(req.body.roomId).select('hotel totalRooms pricing').lean();
            let user = null;
            req.user != null ? user = req.user.id : user = null; 

            if (!roomType) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy loại phòng!',
                });
            }

            if (roomType.totalRooms === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Hiện tại đang hết phòng, rất xin lỗi vì sự bất tiện này!',
                });
            }

            const totalPrice = totalRoomPrice(req.body.checkIn, req.body.checkOut, roomType);
            const discount = req.body.discount || 0;
            const totalAmount = totalPrice - discount;

            const booking = new Booking({
                user,
                hotel: roomType.hotel,
                room: roomType._id,
                checkInDate: req.body.checkIn,
                checkOutDate: req.body.checkOut,
                guests: req.body.guests,
                guestDetails: req.body.guestDetails,
                pricing: {
                    totalPrice,
                    discount,
                    totalAmount
                },
                note: req.body.note,
            });

            booking.bookingNumber = generateBookingCode(totalAmount),


            await booking.save();

            return res.status(200).json({
                success: true,
                message: 'Đã gửi yêu cầu đặt phòng thành công!',
                booking,
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

    // [GET] /api/bookings/
    async myBookings (req, res) {
        try {
            const user = req.user;
            const bookings = await Booking.find({ user }).lean();

            if (!bookings.length) {
                return res.status(200).json({
                    success: true,
                    message: 'Bạn không có booking nào cả!',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Lấy danh sách bookings thành công!',
                bookings
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

    // [GET] /api/bookings/:booking
    async detailsBooking (req, res) {
        try {
            const user = req.user;
            const reason = req.body.reason;
            const bookingNumber = req.params.booking;
            const booking = await Booking.findOne({ bookingNumber }).lean();

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking không tồn tại!',
                })
            }

            if (booking.user.toString() !== user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không đủ điều kiện để truy cập!',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Lấy chi tiết booking thành công!',
                booking
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

    // [PUT] /api/bookings/:booking/cancel
    async cancelBooking (req, res) {
        try {
            const ipAddr = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;
            const role = req.user.role;
            const bookingNumber = req.params.booking;
            const { reason } = req.body;
            const booking = await Booking.findOne({ bookingNumber });
            
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy booking!',
                });
            }

            const hotel = await Hotel.findById(booking.hotel.toString()).select('contact owner').lean();

            if (!hotel) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy khách sạn!',
                });
            }

            const hotline = hotel.contact.hotline;

            if (booking.status === 'confirmed') {
                return res.status(400).json({
                    success: false,
                    message: `Booking đã được xác nhận, bạn không thể huỷ. Vui lòng gọi điện cho hotline: ${hotline} để yêu cầu hỗ trợ!`,
                })
            }

            if (booking.status === 'cancelled') {
                return res.status(400).json({
                    success: false,
                    message: 'Booking đã được huỷ rồi!',
                });
            }

            const payment = await Payment.findOne({ bookingNumber });

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy payment!',
                });
            }

            if (payment.status === 'completed') {
                // Hoàn tiền với momo
                if (payment.method === 'momo') {
                    await saveRefundMomo(payment, 1, reason);
                } else if (payment.method === 'vnpay') {
                    await saveRefundVnpay(payment, ipAddr, 1, reason);
                }
            }

            booking.status = 'cancelled';

            await booking.save();

            return res.status(200).json({
                success: true,
                message: 'Huỷ booking thành công!',
            });

        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
            });
        }
    }

    // [POST] /api/bookings/:booking/review
    async createReview (req, res) {
        try {
            const bookingNumber = req.params.booking;
            const { star, comment, images } = req.body;
            const booking = await Booking.findOne({ bookingNumber }).lean();

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking không tồn tại!',
                });
            }

            if (booking.status !== 'checked_out') {
                return res.status(400).json({
                    success: false,
                    message: 'Chưa thể review booking!',
                });
            }

            const exisingReview = await Review.findOne({ booking: booking._id.toString() }).lean();

            if (exisingReview) {
                return res.status(400).json({
                    success: false,
                    message: 'Booking đã được re'
                })
            }

            const newReview = await Review.create({
                booking: booking._id.toString(),
                user: req.user.id,
                hotel: booking.hotel.toString(),
                ratings: {
                    star,
                    comment,
                    images: []
                }
            });

            const newImagesUrl = await Promise.all(
                images.map(async (image) => {
                const { originUrl, thumbUrl } = await hanldeFinalUpload(image, newReview._id, 'reviews');

                return { originUrl, thumbUrl };
            }));

            newReview.ratings.images = newImagesUrl;
            await newReview.save();

            const reviews = Review.find({ hotel: booking.hotel }).lean();
            const avg = reviews.reduce((acc, r) => acc + (r.ratings.star || 0), 0) / (reviews.length || 1);

            await Hotel.findByIdAndUpdate(booking.hotel, {
                totalReviews: reviews.length,
                averageRating: avg.toFixed(1)
            });

            // Gửi thông báo cảm ơn người dùng đã đánh giá trải nghiệm
            await Notification.create({
                user: req.user.id,
                type: 'system',
                title: 'Cảm ơn bạn đã chia sẻ trải nghiệm của mình!',
                message: 'Cảm ơn bạn vì đã đóng góp ý kiến, chúng tôi sẽ tiếp nhận mọi đánh giá để phát triển!'
            });

            return res.status(200).json({
                success: true,
                message: 'Tạo review thành công!',
                review: newReview
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

    // [PUT] /api/bookings/:booking/confirm (OWNER)
    async confirmBooking (req, res) {
        try {
            const bookingNumber = req.params.booking;
            console.log(bookingNumber);
            const booking = await Booking.findOne({ bookingNumber }).populdate('payment hotel room').select('room status guestDetails payment hotel room pricing user');

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy booking!',
                });
            }

            if (booking.status === 'confirmed') {
                return res.status(400).json({
                    success: false,
                    message: 'Booking đã được chuyển sang trạng thái confirmed!'
                });
            }

            if (booking.payment.status !== 'confirmed') {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể xác nhận lịch đặt phòng do khách hàng chưa thanh toán!'
                });
            }

            booking.status = 'confirmed';
            booking.pointsCanClaim = Math.floor(booking.pricing.totalAmount / 10000) // 1 point = 10.000 VNĐ
            await booking.save();

            await User.findByIdAndUpdate(booking.user, {
                $inc: { points: Math.floor(booking.pricing.totalAmount / 10000) }
            });
            
            const sendEmail = sendNotificationBookingConfirmed(booking.guestDetails.email, booking);

            if (!sendEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Có lỗi khi gửi email cho khách hàng!',
                });
            }

            await booking.save();

            // Gửi thông báo phòng đã được confirm
            await Notification.create({
                user: booking.user,
                type: 'booking_confirmed',
                title: 'Chúc mừng bạn đã book phòng thành công. Chúc bạn có chuyến đi vui vẻ!',
                message: 'Cảm ơn bạn đã lựa chọn chúng tôi để đặt phòng. Chúc quý khách có một trải nghiệm tốt nhất!',
            });

            return res.status(200).json({
                success: true,
                message: 'Cập nhập trạng thái booking và gửi email tới khách hàng thành công!',
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success:false,
                message: 'Lỗi phía server',
                error: err.message
            });
        }
    }

    // [PATCH] /api/bookings/:booking/checkIn (OWNER)
    async checkIn (req, res) {
        try {
            const owner = req.user;
            const bookingNumber = req.params.booking;
            const booking = await Booking.findOne({ bookingNumber });
            const now = Date.now();

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy booking!',
                });
            }

            if (!owner.hotels_owner.includes(booking.hotel.toString())) {
                return res.status(400).json({
                    success: false,
                    message: 'Bạn không có quyền check-in booking này!',
                });
            }

            if (booking.status !== 'confirmed') {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể checkIn vì booking chưa được xác nhận. Vui lòng kiểm tra lại!',
                });
            }

            if (now < booking.checkInDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Chưa đến ngày checkIn!',
                })
            }

            if (booking.payment.status !== 'paid') {
                return res.status(400).json({
                    success: false,
                    message: 'Booking chưa được thanh toán đủ!',
                });
            }

            if (booking.status === 'checked_in') {
                return res.status(400).json({
                    success: false,
                    message: 'Booking đã được check-in rồi!'
                });
            }

            booking.status = 'checked_in';
            await booking.save();

            return res.status(200).json({
                success: true,
                message: 'Cập nhật trạng thái booking sang check-in thành công!',
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

    // [PUT] /api/bookings/:booking/checkOut (OWNER)
    async checkOut (req, res) {
        try {
            const owner = req.user;
            const bookingNumber = req.params.booking;
            const booking = await Booking.findOne({ bookingNumber }).populate('hotel');

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy booking!',
                });
            }

            if (!owner.hotels_owner.includes(booking.hotel.toString())) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền check-in booking này!',
                });
            }

            if (booking.status !== 'checked_in') {
                return res.status(400).json({
                    success: false,
                    message: 'Chưa check-in thì không thể check-out!',
                });
            }

            if (booking.status === 'checked-out') {
                return res.status(400).json({
                    success: false,
                    message: 'Đã check-out rồi!',
                });
            }

            booking.status = 'checked-out';
            await booking.save();

            await Notification.create({
                user: booking.user,
                type: 'review_reminder',
                title: 'Hãy góp ý với chúng tôi về trải nghiệm của bạn!',
                message: `Cảm ơn vì bạn đã lựa chọn chúng tôi trong kì nghỉ tại ${booking.hotel.name}. Hãy để lại đánh giá để chúng tôi có thể cải thiện chất lượng dịch vụ!`,
                link: `/bookings/:booking/create-review`
            });

            return res.status(200).json({
                success: true,
                message: 'Cập nhật trạng thái booking sang check-out thành công!',
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
                erorr: err.mesaage,
            });
        }
    }

    // [PATCH] /api/bookings/:booking/cancell-by-owner (OWNER)
    async cancelledByOwner (req, res) {
        try {
            const ipAddr = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;
            const owner = req.user;
            const { reason } = req.body;
            const bookingNumber = req.params.booking;
            const booking = await Booking.findOne({ bookingNumber });

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking không tồn tại!',
                });
            }

            if (!owner.hotels_owner.includes(booking.hotel)) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền truy cập vào booking này',
                });
            }

            if (booking.status !== 'confirmed') {
                return res.status(400).json({
                    success: false,
                    message: 'Bạn không thể huỷ booking này!',
                });
            }

            if (booking.status === 'cancelled') {
                return res.status(400).json({
                    success: false,
                    message: 'Booking đã được huỷ rồi!',
                });
            }

            const payment = await Payment.findOne({ bookingNumber });

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy payment!',
                });
            }

            if (payment.method === 'momo') {
                await saveRefundMomo(payment, 1, reason);
            } else if (payment.method === 'vnpay') {
                await saveRefundVnpay(payment, ipAddr, 1, reason);
            }

            // Hoàn lại điểm của người dùng
            await User.findByIdAndUpdate(booking.user, {
                $inc: { points: -booking.pointsCanClaim }
            });

            booking.status = 'cancelled';

            await booking.save();

            return res.status(200).json({
                success: true,
                message: 'Huỷ booking thành công!',
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

} 

module.exports = new BookingController();
