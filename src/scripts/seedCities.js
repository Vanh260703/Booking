const mongoose = require('mongoose');
const City = require('../app/models/City');
const path = require('path');
const srcDir = path.join(__dirname, '..');
const envPath = path.join(srcDir, 'config', '.env');
require('dotenv').config({path: envPath})
const cities = [
  {
    name: 'Hà Nội',
    slug: 'ha-noi',
    description: 'Thủ đô ngàn năm văn hiến với nhiều di tích lịch sử và ẩm thực đặc sắc.',
    image: 'https://example.com/hanoi.jpg',
    location: {
        type: 'Point',
        coordinates: [105.83416, 21.02776]
    }
  },
  {
    name: 'Thành Phố Hồ Chí Minh',
    slug: 'thanh-pho-ho-chi-minh',
    description: 'Thành phố năng động, trung tâm kinh tế lớn nhất Việt Nam.',
    image: 'https://example.com/hcm.jpg',
    location: {
        type: 'Point',
        coordinates: [106.6602, 10.7626]
    }
  },
  {
    name: 'Đà Nẵng',
    slug: 'da-nang',
    description: 'Thành phố đáng sống nhất Việt Nam với biển Mỹ Khê và cầu Rồng nổi tiếng.',
    image: 'https://example.com/danang.jpg',
    location: {
        type: 'Point',
        coordinates: [108.2022, 16.0544]
    },
    isPopular: true
  },
  {
    name: 'Huế',
    slug: 'hue',
    description: 'Kinh đô xưa của triều Nguyễn, nổi tiếng với Hoàng thành và ẩm thực cung đình.',
    image: 'https://example.com/hue.jpg',
    location: {
        type: 'Point',
        coordinates: [107.6900375, 16.5530473]
    },
    isPopular: true
  },
  {
    name: 'Hạ Long',
    slug: 'ha-long',
    description: 'Vịnh Hạ Long – kỳ quan thiên nhiên thế giới với hàng nghìn hòn đảo đá vôi.',
    image: 'https://example.com/halong.jpg',
    location: {
        type: 'Point',
        coordinates: [107.0733028, 20.9517043]
    }
  },
  {
    name: 'Nha Trang',
    slug: 'nha-trang',
    description: 'Thành phố biển xinh đẹp với nhiều khu nghỉ dưỡng và hòn đảo thơ mộng.',
    image: 'https://example.com/nhatrang.jpg',
    location: {
        type: 'Point',
        coordinates: [109.1941443, 12.2348769]
    },
    isPopular: true
  },
  {
    name: 'Đà Lạt',
    slug: 'da-lat',
    description: 'Thành phố ngàn hoa, khí hậu mát mẻ quanh năm và nhiều điểm du lịch lãng mạn.',
    image: 'https://example.com/dalat.jpg',
    location: {
        type: 'Point',
        coordinates: [108.4375758, 11.9402416]
    },
    isPopular: true
  },
  {
    name: 'Phú Quốc',
    slug: 'phu-quoc',
    description: 'Đảo ngọc nổi tiếng với bãi biển trong xanh và các khu resort cao cấp.',
    image: 'https://example.com/phuquoc.jpg',
    location: {
        type: 'Point',
        coordinates: [103.9590544, 10.2170911]
    },
    isPopular: true
  },
];

(async () => {
    try {
      await mongoose.connect(`${process.env.MONGODB_URI}`);
      console.log('✅ Kết nối đến database thành công!!!');

      for (const city of cities) {
          const exising = await City.findOne({ slug: city.slug });

          if (!exising) {
              await City.create(city);
              console.log(`Thêm thành phố ${city.name} thành công!`);
          } else {
              console.log(`Thành phố ${city.name} đã tồn tại, không cần thêm lại!`);
          }
      }
      console.log('Hoàn tất khởi tạo dữ liệu thành phố!');
    } catch (err) {
        console.error('Có lỗi khi khởi tạo dữ liệu thành phố: ', err);
    } finally {
        await mongoose.disconnect();
    }
})(); 