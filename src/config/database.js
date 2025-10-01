const mongoose = require('mongoose');
require('dotenv').config();
const mongoDB = process.env.PORT;
console.log(mongoDB);

async function connect() {
    try {
        console.log(`${process.env.MONGODB_URI}`);
        await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log('✅ Kết nối đến database thành công!!!');
    } catch (err) {
        console.log(err);
        console.log('❌ Kết nối đến database thất bại!!!');
    }
}

module.exports = { connect };