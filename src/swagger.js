const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Booking API',
    description: 'Tài liệu API tự động sinh ra từ Express routes',
  },
  host: 'localhost:3000',
  schemes: ['http'],
  tags: [
    { name: 'Auth', description: 'Các API xác thực và đăng nhập' },
    { name: 'User', description: 'Các API người dùng' },
    { name: 'City', description: 'Các API thành phố' },
    { name: 'Hotel', description: 'Các API khách sạn' },
    { name: 'Booking', description: 'Các API booking' },
    { name: 'Payment', description: 'Các API thanh toán' },
    { name: 'Room', description: 'Các API phòng trong khách sạn' },
    { name: 'Search', description: 'Các API tìm kiếm' },
  ],
  securityDefinitions: {
    cookieAuth: {
      type: 'apiKey',
      in: 'cookie',
      name: 'accessToken',
      description: 'JWT lưu trong cookie',
    },
  },
  security: [
    {
      cookieAuth: [],
    },
  ],
};

const outputFile = './src/swagger-output.json';
const endpointsFiles = ['./src/routes/index.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
