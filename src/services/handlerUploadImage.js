const convertToWebp = require('../utils/convertToWebp');
const { uploadBufferToMinio, cutFileInMinio } = require('./minioService');
const fs = require('fs');

async function handleAvatar(file) {
    try {
        // 1. Chuyển file gốc thành định dạng webp
        const avatarBuffer = await convertToWebp(file.buffer, null, 'avatar');

        // 2. Tạo tên file trên MinIO để tránh bị trùng lặp
        const avatarFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`;

        // 3. Upload ảnh lên MinIO trả về url
        const avatarUrl = await uploadBufferToMinio(`avatar/${avatarFileName}`, avatarBuffer);

        return avatarUrl;

    } catch (err) {
        console.log('Có lỗi khi xử lý hình ảnh: ', err);
        return;
    }
}

async function handleImagesWithType(file, type) {
    try {
        // 1. Tách thành 1 file gốc và 1 file webp
        const { originalBuffer, thumbBuffer } = await convertToWebp(file.buffer, null, type);

        // 2. Tạo tên file trên MinIO
        const originalFileName = `${type}${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${file.originalname.slice(file.originalname.indexOf('.')+1)}`;
        const thumbFileName = `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}_thumb.webp`;

        // 3. Upload lên MinIO
        const originUrl = await uploadBufferToMinio(`temp/${originalFileName}`, originalBuffer);
        const thumbUrl = await uploadBufferToMinio(`temp/${thumbFileName}`, thumbBuffer);

        return {
            tempOrigin: originUrl.slice(originUrl.indexOf('temp')),
            tempThumb: thumbUrl.slice(thumbUrl.indexOf('temp'))
        };
    } catch (err) {
        console.log('Có lỗi khi xử lý ảnh: ', err);
        return;
    }
}

async function hanldeFinalUpload(tempUrl, typeId, type) {
    try {
        const { tempOrigin, tempThumb } = tempUrl;

        const originPath = tempOrigin.replace('/temp', `${type}/${typeId}`);
        const thumbPath = tempThumb.replace('/temp', `${type}/${typeId}`);
    
        const [originUrl, thumbUrl] = await Promise.all([
            cutFileInMinio(originPath, tempOrigin),
            cutFileInMinio(thumbPath, tempThumb)
        ]);

        return { originUrl, thumbUrl };
    } catch (err) {
        console.log(err);
        return;
    }
}

module.exports = { handleAvatar, handleImagesWithType, hanldeFinalUpload };