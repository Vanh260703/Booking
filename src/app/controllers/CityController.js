const City = require('../models/City');
const slugify = require('slugify');
const { getLocationDataForCity } = require('../../services/processingLocation');

class CityController {
    // [GET] /api/cities
    async cities (req, res) {
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

    // [POST] /api/cities
    async addCity (req, res) {
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

            const locationData = await getLocationDataForCity(name);

            const newCity = new City({
                name, 
                slug,
                description,
                images: locationData.images,
                location: {
                    type: 'Point',
                    coordinates: locationData.coordinates,
                },
                isPopular,
            });

            await newCity.save();

            return res.status(200).json({
                success: true,
                message: 'Thêm thành phố thành công!',
                newCity,
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

    // [GET] /api/cities/search
    async searchingCity (req, res) {
        try {
            const search = req.query.q?.trim();
           
            if (!search) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu từ khoá tìm kiếm!',
                });
            }

            const results = await City.find({
                name: { $regex: search, $options: 'i'}
            }).lean();

            if (!results.length) {
                return res.status(200).json({
                    success: true,
                    message: 'Không tìm thấy kết quả tìm kiếm!',
                    results: [],
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Trả về kết quả thành công!',
                results,
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

    // [GET] /api/cities/:city
    async detailsCity (req, res) {
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
                city
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

    // [PUT] /api/cities/:city
    async updateCity (req, res) {
        try {
            const updateFields = req.body;
            const citySlug = req.params.city;
            const city = await City.findOne({ slug: citySlug });

            if (!city) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thành phố!',
                });
            }

            Object.assign(city, updateFields);

            await city.save();

            return res.status(200).json({
                success: true,
                message: 'Cập nhật thành công!',
                city,
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

    // [DELETE] /api/cities/:city
    async deleteCity (req, res) {
        try {
            const citySlug = req.params.city;
            const city = await City.findOneAndDelete({ slug: citySlug })

            if (!city) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thành phố!',
                });
            }
            
            return res.status(200).json({
                success: true,
                message: 'Xoá thành phố thành công!',
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