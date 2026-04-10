const Coupon = require('../models/Coupon');
const Booking = require('../models/Booking');
const User = require('../models/User');
class CouponController {
    // [GET] /api/coupons/change-points-to-coupon
    async changePointsToCoupon (req, res) {
        try {
            const now = new Date();
            const coupons = await Coupon.find({
                isActive: true,
                startDate: { $lte: now },
                endDate: { $gte: now },
                isRedeemable: true
            }).lean();

            return res.status(200).json({
                success: true,
                message: coupons.length > 0 ? 'Lấy danh sách coupons thành công!' : 'Hiện chưa có coupon nào!'
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
                error: err.message
            });
        }
    }

    // [GET] /api/coupons/available
    async availableCoupon (req, res) {
        try {
            const now = new Date();
            const bookingNumber = req.query.bookingNumber;
            const booking = await Booking.findOne({ bookingNumber });

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking không tồn tại!'
                });
            }
            // Lấy các coupons đang hoạt động trong thời gian này
            const coupons = await Coupon.find({
                isActive: true,
                startDate: { $lte: now },
                endDate: { $gte: now },
            }).lean();

            if (!coupons.length) {
                return res.status(200).json({
                    success: true,
                    message: 'Hiện không có voucher nào khả dụng!',
                    coupons,
                });
            }

            const validCoupons = coupons.filter((coupon) => {
                const usedCount = coupon.usedBy.filter(u => u.user.toString() === booking.user.toString()).length;

                const underUserLimit = usedCount <= coupon.userLimit;
                const stillAvailable = coupon.maxUsage > coupon.usedCount;

                return underUserLimit && stillAvailable;
            });

            return res.status(200).json({
                success: true,
                message: validCoupons.length > 0 ? 'Lấy danh sách voucher khả dụng thành công!' : 'Hiện không có voucher nào khả dụng!',
                coupons: validCoupons,
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

    // [GET] /api/coupons/validate/:code
    async validateCode (req, res) {
        try {
            const code = req.params.code;
            const now = new Date();
            const bookingNumber = req.query.bookingNumber;
            const booking = await Booking.findOne({ bookingNumber });

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking không tồn tại!'
                });
            }

            const coupon = await Coupon.findOne({ code });

            if (!coupon) {
                return res.status(404).json({
                    success: false,
                    message: 'Coupon không tồn tại!',
                });
            }

            if (now < coupon.startDate || now > coupon.endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Voucher không khả dụng!',
                });
            }

            if (!coupon.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'Voucher không khả dụng!',
                });
            }

            if (coupon.usedCount >= coupon.maxUsage) {
                return res.status(400).json({
                    success: false,
                    message: 'Voucher không khả dụng!',
                });
            }

            const usedCount = coupon.usedBy.filter(u => u.user.toString() === booking.user.toString()).length;

            if (usedCount >= coupon.userLimit) {
                return res.status(400).json({
                    success: false,
                    message: 'Voucher không khả dụng!',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Voucher khả dụng!',
                voucher: coupon
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

    // [POST] /api/coupons/redeem/:code
    async claimCoupon (req, res) {
        try {
            const code = req.params.code;
            const now = new Date();
            const coupon = await Coupon.findOne({ code });

            if (!coupon) {
                return res.status(404).json({
                    success: false,
                    message: 'Coupon khônng tồn tại!',
                });
            }

            const user = await User.findById(req.user.id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy người dùng!'
                });
            }

            const isAvailableCoupon = await Coupon.findOne({ code }, {
                isActive: true,
                startDate: { $lte: now },
                endDate: { $gte: now },
                isRedeemable: true,
                requiredPoints: { $lte: user.points }
            }).lean();

            if (!isAvailableCoupon) {
                return res.stauts(400).json({
                    success: false,
                    message: 'Không thể đổi coupon này!'
                });
            }

            user.redeemedCoupons.push(availableCoupon._id);
            user.points -= availableCoupon.requiredPoints;

            await user.save();

            return res.status(200).json({
                success: true,
                message: 'Chúc mừng bạn đã đổi coupon thành công!'
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

    // [POST] /api/coupons/apply/:code
    async applyCoupon (req, res) {
        try {
            const bookingNumber = req.query.bookingNumber;
            const couponCode = req.params.code;
            const booking = await Booking.findOne({ bookingNumber });

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking không tồn tại!',
                });
            }
            const totalPrice = booking.pricing.totalPrice;
            console.log('TOTAL PRICE: ', totalPrice);
            const coupon = await Coupon.findOne({ code: couponCode });

            if (!coupon) {
                return res.status(404).json({
                    success: false,
                    message: 'Coupon không tồn tại!',
                });
            }

            if (coupon.type === 'percent') {
                booking.pricing.discount = totalPrice > coupon.maxAmount ? Math.floor(coupon.maxAmount * (coupon.value / 100)) : Math.floor(totalPrice * (coupon.value / 100));
            } else {
                booking.pricing.discount = coupon.value;
            }

            console.log('DISCOUNT: ', booking.pricing.discount);

            booking.pricing.totalAmount = totalPrice - booking.pricing.discount;
            coupon.usedCount++;

            const usedData = {
                user: booking.user,
                usedAt: Date.now(),
                booking: booking._id
            };

            coupon.usedBy.push(usedData);

            await Promise.all([booking.save(), coupon.save()]);

            return res.status(200).json({
                success: true,
                message: 'Áp dụng voucher thành công'
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

    // [GET] /api/coupons/ (ADMIN & OWWNER)
    async coupons (req, res) {
        try {   
            const role = req.user.role;
            const filter = {};

            if (role === 'user') {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không đủ điều kiện để truy cập!',
                });
            }

            if (role === 'hotel_owner') {
                filter.createdBy = req.user.id;
            }

            const coupons = await Coupon.find(filter).lean();

            if (!coupons.length) {
                return res.status(200).json({
                    success: true,
                    message: 'Chưa tồn tại coupon nào!'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Lấy danh sách coupon thành công!',
                coupons
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server'
            });
        }
    }

    // [GET] /api/coupons/used (ADMIN & OWNER)
    async usedCoupons (req, res) {
        try {
            const role = req.user.role;
            const { from, to } = req.query;
            
            if (role === 'user') {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không đủ điều kiện để truy cập!',
                });
            }

            const fromDate = from ? new Date(from) : new Date('2012-11-07');
            const endDate = to ? new Date(to) : new Date();
            
            const filter = {
                usedCount: { $gt: 0 },
            };

            if (role === 'hotel_owner') {
                filter.createdBy = req.user.id;
            }

            const usedCoupons = await Coupon.find(filter);

            if (!usedCoupons.length) {
                return res.status(200).json({
                    success: true,
                    message: 'Chưa có voucher nào được sử dụng!',
                });
            }

            const usedCouponsInTime = usedCoupons.filter((usedCoupon) => {
                const validUsedCoupon = usedCoupon.usedBy.filter(u => u.usedAt >= fromDate && u.usedAt <= endDate);
                return validUsedCoupon.length > 0;
            });

            return res.status(200).json({
                success: true,
                message: usedCouponsInTime.length > 0 ? 'Lấy danh sách coupon đã sử dụng thành công' : 'Không có coupon nào được sử dụng trong thời gian này',
                coupons: usedCouponsInTime
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

    // [POST] /api/coupons/ (ADMIN & OWWNER)
    async createCoupon (req, res) {
        try {
            const role = req.user.role;
            const hotelId = req.query.hotel || null;
            const { startDate, code, endDate, ...rest } = req.body;
            if (role === 'user') {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không đủ điều kiện để truy cập!',
                });
            }

            if (new Date(startDate) > new Date(endDate)) {
                return res.status(400).json({
                    success: false,
                    message: 'Ngày bắt đầu không được lớn hơn ngày kết thúc!'
                });
            }

            const exisingCoupon = await Coupon.findOne({ code: req.body.code }).lean();
            if (exisingCoupon) {
                return res.status(400).json({
                    success: false,
                    message: 'Coupon đã tồn tại, vui lòng kiểm tra lại!'
                });
            }
        
            const couponData = {
                ...rest, 
                code,
                startDate,
                endDate,
                hotel: role === 'hotel_owner' ? hotelId : null,
                createdBy: req.user.id,
                createdByRole: role,
            };
            await Coupon.create(couponData);

            return res.status(200).json({
                success: true,
                message: 'Tạo mới coupon thành công!'
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

    // [PUT] /api/coupons/:code (ADMIN & OWWNER)
    async updateCoupon (req, res) {
        try {
            const code = req.params.code;

            if (req.user.role === 'user') {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không đủ điều kiện để truy cập!',
                });
            }

            const coupon = await Coupon.findOne({ code});
            
            if (!coupon) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy coupon',
                });
            }

            if (coupon.createdByRole !== req.user.role) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không đủ điều kiện để truy cập!',
                })
            }

            if (req.user.role === 'hotel_owner' && !req.user.hotel.includes(coupon.hotel)) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không đủ điều kiện để truy cập!'
                });
            }

            Object.assign(coupon, req.body);

            await coupon.save();

            return res.status(200).json({
                success: true,
                message: 'Cập nhật coupon thành công!',
                coupon
            })

        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
                error: err.message
            })
        }
    }

    // [DELETE] /api/coupons/:code(ADMIN & OWWNER)
    async deleteCoupon (req, res) {
        try {
            const code = req.params.code;
            const role = req.user.role;

            if (role === 'user') {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không đủ điều kiện để truy cập!',
                });
            }

            const coupon = await Coupon.findOne({ code });
            
            if (!coupon) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy coupon',
                });
            }

            if (coupon.createdByRole !== req.user.role) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không đủ điều kiện để truy cập!',
                })
            }

            if (req.user.role === 'hotel_owner' && !req.user.hotel.includes(coupon.hotel)) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không đủ điều kiện để truy cập!'
                });
            }

            await coupon.remove();

            return res.status(200).json({
                success: true,
                message: 'Xoá coupon thành công!',
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

module.exports = new CouponController();