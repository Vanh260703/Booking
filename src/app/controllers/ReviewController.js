const Review = require('../models/Review');
const Booking = require('../models/Booking');
const User = require('../models/User');
class ReviewController {
    // [GET] /api/reviews/:hotelId
    async reviewsInHotel (req, res) {
        try {
            const hotelId = req.params.hotelId;
            const reviews = await Review.find({ hotel: hotelId }).lean();

            return res.status(200).json({
                success: true,
                message: reviews.length > 0 ? 'Lấy danh sách reviews thành công!' : 'Khách sạn hiện chưa có đánh giá nào!',
                reviews,
            });
        } catch (err){
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
                error: err.message
            });
        }
    }

    // [PUT] /api/reviews/:review
    async fixReview (req, res) {
        try {
            const reviewId = req.params.review;
            const { newComment } = req.body;
            const user = req.user;
            const review = await Review.findById(reviewId);

            if (!review) {
                return res.status(404).json({
                    success: false,
                    message: 'Review không tồn tại!',
                });
            }

            if (review.user.toString() !== user.id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền chỉnh sửa review này!',
                });
            }

            review.ratings.comment = newComment;
            review.isFixed = true;

            await review.save();

            return res.status(200).json({
                success: true,
                message: 'Chỉnh sửa review thành công!',
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

module.exports = new ReviewController();