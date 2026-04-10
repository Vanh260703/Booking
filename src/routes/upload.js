const express = require('express');
const router = express.Router();

const Authentication = require('../middlewares/authentication');
const upload = require('../middlewares/upload');

const uploadController = require('../app/controllers/UploadController');
const OwnerMiddleware = require('../middlewares/ownerMiddleware');
const AdminAuthentication = require('../middlewares/adminAuthentication');

// USER ONLY
router.post('/avatar', Authentication, upload.single('avatar'), uploadController.uploadAvatar);
router.post('/reviews', Authentication, upload.array('reviews', 5), uploadController.uploadReviews)

// OWNER ONLY
router.post('/hotel/:hotelId/images', Authentication,  OwnerMiddleware, upload.array('hotels', 10), uploadController.uploadHotelImages);
router.post('/hotel/:hotelId/:roomId/images', Authentication, OwnerMiddleware, upload.array('rooms', 5), uploadController.uploadRoomImages);

// ADMIN ONLY
// router.post('/banner', Authentication, OwnerMiddleware, upload.)


module.exports = router;