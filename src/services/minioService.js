const minioClient = require('../config/minio');
const bucket = process.env.MINIO_BUCKET;
const MINIO_URL = process.env.MINIO_PUBLIC_URL
const path = require('path');

// Khởi tạo bucket nếu chưa tồn tại
async function initMinioBucket() {
    try {
        const exists = await minioClient.bucketExists(bucket);

        if (!exists) {
            await minioClient.makeBucket(bucket, 'us-east-1');
            console.log('Khởi tạo bucket thành công!');
        } else {
            console.log('Bucket đã được khởi tạo, không cần khơi tạo lại!');
        }
    } catch (err) {
        console.error("MINIO ERROR:", err);
    }
}

async function uploadBufferToMinio(filename, buffer) {
    await minioClient.putObject(bucket, filename, buffer , {'Content-Type': 'image/webp'});
    console.log('Upload thành công lên MinIO');

    const returnUrl = `${MINIO_URL}/${bucket}/${filename}`;

    return returnUrl;
}

async function cutFileInMinio(newFile, oldFile) {
    try {
        await minioClient.copyObject(bucket, newFile, oldFile);
        await minioClient.removeObject(bucket, oldFile);

        return `${MINIO_URL}/${bucket}/${newFile}`;
    } catch (err) {
        console.log('Có lỗi khi cut: ', err);
        return;
    }
}

async function deleteFromMinio(fileName) {
    try {
        await minioClient.removeObject(bucket, fileName);
        console.log(`Xoá thành công ${fileName} từ MINIO`);
    } catch (err) {
        console.log('Có lỗi khi xoá file: ', err);
        return;
    }
}

module.exports = { initMinioBucket, uploadBufferToMinio, cutFileInMinio, deleteFromMinio };

