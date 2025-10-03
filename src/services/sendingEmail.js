const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);

    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Gửi mail reset password
async function sendResetPassword(toEmail, resetLink) {
    const mailOptions = {
        form: `BOOKING HOTEL <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Yêu cầu đặt lại mật khẩu',
        html: `
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
            <p>Bấm vào link dưới đây để thay đổi mật khẩu:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
        `
    };

    return transporter.sendMail(mailOptions);
};

// Gửi mail verify account 
async function sendVerifyAccount(toEmail, verifyLink) {
    const mailOptions = {
        form: `BOOKING HOTEL <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Xác thực tài khoản của bạn',
        html: `
            <p>Chào bạn,</p>
            <p>Bấm vào link dưới đây để xác thực tài khoản:</p>
            <a href="${verifyLink}">${verifyLink}</a>
            <p>Link có hiệu lực trong 24h</p>
        `
    };

    return transporter.sendMail(mailOptions);
}

module.exports = { sendResetPassword, sendVerifyAccount };



