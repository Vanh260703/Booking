const express = require('express');
const router = express.Router();

const userController = require('../app/controllers/UserController');
const Authentication = require('../middlewares/authentication');
const AdminAuthentication = require('../middlewares/adminAuthentication');

router.get('/profile', Authentication, userController.profile);

router.put('/profile', Authentication, userController.updateProfile);

router.patch('/change-password', Authentication, userController.changePassword);

router.delete('/account', Authentication, userController.deleteAccount);

router.get('/:id', Authentication, AdminAuthentication, userController.detailsUser);

router.get('/', Authentication, AdminAuthentication, userController.users);

router.patch('/:id/role', Authentication, AdminAuthentication, userController.updateRole);


module.exports = router;