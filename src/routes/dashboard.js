const express = require('express');
const router = express.Router();

const Authentication = require('../middlewares/authentication');
const OwnerMiddleware = require('../middlewares/ownerMiddleware');
const AdminAuthentication = require('../middlewares/adminAuthentication');

const dashboardController = require('../app/controllers/DashboardController');

router.get('/admin', Authentication, AdminAuthentication, dashboardController.adminDashboard);
// router.get('/hotel-owner', Authentication, OwnerMiddleware, dashboardController.hotelOwnerDashboard);

module.exports = router;