const mongoose = require('mongoose');
const path = require('path');
const User = require('../app/models/User');
const srcDir = path.join(__dirname, '..');
const envPath = path.join(srcDir, 'config', '.env');
require('dotenv').config({path: envPath});
const bcrypt = require('bcrypt');

(async () => { 
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log('✅ Kết nối đến database thành công!!!');

        const username = process.env.ADMIN;
        const password = process.env.ADMIN_PASSWORD;

        const existingAdmin = await User.findOne({ username });
        if (existingAdmin) {
            console.log('ADMIN đã tồn tại, bỏ qua!');
            return;
        } 
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name: 'ADMIN',
            username,
            password: hashedPassword,
            role: 'admin',
            status: 'active',
            isVerify: true,
        });
        console.log('Khởi tạo admin thành công!');
    } catch (err) {
        console.err('Có lỗi khi khởi tạo admin: ', err);
    } finally {
        await mongoose.disconnect();
    }
})()