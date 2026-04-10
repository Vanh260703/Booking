const jwt = require('jsonwebtoken');
const Hotel = require('../app/models/Hotel');

async function OwnerMiddleware(req, res, next) {
    const user = req.user;

    if (user.role !== 'hotel_owner') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ chủ khách sạn mới có quyền truy cập!',
      });
    }

    const hotels = await Hotel.find({ owner: user.id}).select('owner');
    user.hotels_owner = hotels.map((hotel) => hotel._id.toString());

    next();
}

module.exports = OwnerMiddleware;