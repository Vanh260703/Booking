const City = require('../models/City');
const slugify = require('slugify');
const geoJSON = require('geojson');

const cityCoordinates = {
  'Hà Nội': [105.83416, 21.02776],
  'Hải Phòng': [106.6823, 20.8649],
  'Đà Nẵng': [108.2022, 16.0544],
  'Nha Trang': [109.1967, 12.2388],
  'Phú Quốc': [103.9676, 10.2899],
  'Hội An': [108.3380, 15.8801],
  'Đà Lạt': [108.4380, 11.9404],
  'Vũng Tàu': [107.0843, 10.3460],
  'Hồ Chí Minh': [106.6602, 10.7626],
  'Huế': [107.5847, 16.4637],
};

class CityController {
    // [GET] /api/cities
    async cities(req, res) {
        try {
            const cities = await City.find({}).lean();

            if (!cities.length) {
                return res.status(401).json({
                    success: false,
                    message: 'Lấy danh sách thành phố thất bại!',
                    cities: [],
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Lấy danh sách thành phố thành công!',
                cities,
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

    // [GET] /api/cities/:id
    async detailsCity(req, res) {
        try {
            const cityID = req.params.id;
            const city = await City.findById(cityID).lean();

            if (!city) {
                return res.status(401).json({
                    success: false,
                    message: 'Lấy chi tiết thông tin thành phố thất bại!',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Lấy chi tiết thông tin thành phố thành công!',
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

    // [POsT] /api/cities
    async addCity(req, res) {
        try {
            const { name, description, images, isPopular } = req.body;
            const slug = slugify(name, {
                replacement: '-',
                lower: true,
                locale: 'vi',
                strict: true,
            })
            const exisingCity = await City.findOne({ slug }).lean();

            if (exisingCity) {
                return res.status(401).json({
                    success: false,
                    message: 'Thành phố đã tồn tại. Vui lòng kiểm tra lại!',
                });
            }

            const coordinates = cityCoordinates[name];
            
            if (!coordinates) {
                return res.status(400).json({
                    success: false,
                    message: 'Không có dữ liệu toạ độ cho thành phố này!',
                });
            }

            const newCity = new City({
                name, 
                slug,
                description,
                images,
                location: {
                    type: 'Point',
                    coordinates,
                },
                isPopular,
            });

            await newCity.save();

            return res.status(200).json({
                success: true,
                message: 'Thêm thành phố thành công!',
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
}

module.exports = new CityController();