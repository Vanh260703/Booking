const User = require('../models/User');
const Hotel = require('../models/Hotel');
const RoomType = require('../models/RoomType');
const { uploadToMinio, deleteFromMinio } = require('../../services/minioService');
const convertToWebp = require('../../utils/convertToWebp');
const {handleAvatar, handleImagesWithType, hanldeFinalUpload} = require('../../services/handlerUploadImage');
const fs = require('fs');
const path = require('path');
class UploadController {
    // [POST] /api/upload/avatar
    async uploadAvatar (req, res) {
        try {
            const file = req.file;
            console.log(file);
            const avatarUrl = await handleAvatar(file);

            console.log(avatarUrl);
            const user = await User.findById(req.user.id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Người dùng không tồn tại!'
                });
            }

            if (user.avatar) {
                const filename = `avatar/${path.parse(user.avatar).base}`;
                await deleteFromMinio(filename);
            }

            user.avatar = avatarUrl;
            await user.save();

            return res.status(200).json({
                success: true,
                message: 'Cập nhật ảnh đại diện thành công!'
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                mesasge: 'Lỗi phía server',
                error: err.message
            });
        }
    }

    // [POST] /api/upload/reviews
    async uploadReviews(req, res) {
        try {
            const files = req.files;            
            const reviewsImages = await Promise.all(
                files.map(async (file) => {
                    const { tempOrigin, tempThumb } = await handleImagesWithType(file, file.fieldname);

                    return { tempOrigin, tempThumb };
                })
            )
            return res.status(200).json({
                success: true,
                mesasge: 'Upload ảnh thành công!',
                reviewsImages
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi phía server',
            });
        }
    }

    // [POST] /api/upload/hotel/:hotelId/images
    async uploadHotelImages (req, res) {
        try {
            const hotelId = req.params.hotelId;
            const owner = req.user;

            if (!owner.hotels_owner.includes(hotelId)) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không đủ quyền hạn để truy cập!',
                });
            }

            const files = req.files;
            const imagesHotel = await Promise.all(
                files.map( async (file) => {
                const { tempOrigin, tempThumb } = await handleImagesWithType(file, file.fieldname);
                
                return {
                    tempOrigin,
                    tempThumb
                }
            }));

            return res.status(200).json({
                success: true,
                message: 'Upload ảnh thành công',
                imagesHotel
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

    // [POST] /api/upload/hotel/:hotelId/:roomId/images
    async uploadRoomImages (req, res) {
        try {
            const hotelId = req.params.hotelId;
            const roomTypeId = req.params.roomId;
            const owner = req.user;
            const files = req.files;

            const hotel = await Hotel.findById(hotelId).lean();

            if (!hotel) {
                return res.status(404).json({
                    success: false,
                    message: 'Khách sạn không tồn tại!',
                });
            }

            if (!owner.hotels_owner.includes(hotelId)) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không đủ quyền hạn để truy cập!',
                });
            }

            const roomType = await RoomType.findById(roomTypeId);

            if (!roomType) {
                return res.status(404).json({
                    success: false,
                    message: 'Loại phòng không tồn tại!'
                })
            }

            if (roomType.hotel.toString() !== hotelId) {
                return res.status(403).json({
                    success: false,
                    message: 'Loại phòng này không thuộc khách sạn!',
                })
            }

            const roomImages = files.map(async (file) => {
                const { tempOrigin, tempThumb } = await handleImagesWithType(file, file.fieldname);
                
                return {
                    tempOrigin,
                    tempThumb
                }
            });

            return res.status(200).json({
                success: true,
                message: 'Upload ảnh thành công!',
                roomImages
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

module.exports = new UploadController();