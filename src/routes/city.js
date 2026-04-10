// #swagger.tags = ['City']
const express = require('express');
const router = express.Router();

const cityController = require('../app/controllers/CityController');
const Authentication = require('../middlewares/authentication');
const AdminAuthentication = require('../middlewares/adminAuthentication');

router.get('/', 
    /* 
        #swagger.tags = ['City'] 
        #swagger.summary = 'Lấy danh sách thành phố'
        #swagger.description = 'Lấy toàn bộ các thành phố trong hệ thống'
    */ 
    cityController.cities);
router.get('/:city',  
    /* 
        #swagger.tags = ['City'] 
        #swagger.summary = 'Lấy chi tiết một thành phố'
        #swagger.description = 'Lấy chi tiết một thành phố thông qua ID'
    */ 
    cityController.detailsCity);

// ADMIN ONLY
router.post('/', Authentication, AdminAuthentication, 
    /* 
        #swagger.tags = ['City'] 
        #swagger.summary = 'Thêm mới một thành phố'
        #swagger.description = 'Dành cho admin: Thêm mới một thành phố vào hệ thống'
    */ 
    cityController.addCity);
router.put(':city', Authentication, AdminAuthentication, 
    /* 
        #swagger.tags = ['City'] 
        #swagger.summary = 'Cập nhật thông tin về thành phố'
        #swagger.description = 'Dành cho admin: Cập nhật thông tin về thành phố thông qua ID'
    */ 
    cityController.updateCity);

module.exports = router;