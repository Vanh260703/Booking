const express = require('express');
const router = express.Router();

const cityController = require('../app/controllers/CityController');
const Authentication = require('../middlewares/authentication');
const AdminAuthentication = require('../middlewares/adminAuthentication');

router.get('/', cityController.cities);

router.get('/:id', cityController.detailsCity);

router.post('/', Authentication, AdminAuthentication, cityController.addCity);

module.exports = router;