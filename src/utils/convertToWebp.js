const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function convertToWebp(inputBuffer, outputPath, type) {
    try {
        if (type === 'avatar') {
            // Resize về 300x300 
            const buffer = await sharp(inputBuffer) 
                .resize(300, 300, { fit: 'cover' })
                .webp({ quality: 80 })
                .toBuffer();
                
            console.log('Convert avatar thành công!');
            return buffer;
        } else {
            // Lưu ảnh thumbnail
            const thumbBuffer = await sharp(inputBuffer)
                .resize(400, 400, { fit: 'cover' })
                .webp({ quality: 80 })
                .toBuffer();    

            console.log('Convert avatar thành công!');
            return {
                originalBuffer: inputBuffer,
                thumbBuffer
            };
        }
    } catch (err) {
        console.error('Lỗi khi convert sang webp:', err);
        return null;
    }
}

module.exports = convertToWebp;