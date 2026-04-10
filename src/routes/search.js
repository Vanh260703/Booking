
const express = require('express');
const router = express.Router();

const searchingController = require('../app/controllers/SearchingController');

router.get('/', /* #swagger.tags = ['Search'] */ searchingController.searching);
router.post('/', /* #swagger.tags = ['Search'] */ searchingController.searchingDetail);

module.exports = router;
