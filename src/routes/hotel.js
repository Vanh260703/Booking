const express = require('express');
const router = express.Router();

const hotelController = require('../app/controllers/HotelController');
const Authentication = require('../middlewares/authentication');
const AdminAuthentication = require('../middlewares/adminAuthentication');

router.get('/', hotelController.hotels);

router.get('/:id', hotelController.detailsHotel);

router.get('/featured', hotelController.featuredHotels);

router.get('/:id/available-rooms', hotelController.availableRooms);

router.post('/', Authentication, AdminAuthentication, hotelController.createHotel);

module.exports = router;