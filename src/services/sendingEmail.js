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

// Gửi mail thông báo mật khẩu đã được thay đổi
async function sendNotificationChangePassword(toEmail, changePasswordTime, recoverLink) {
    const mailOptions = {
        form: `BOOKING HOTEL <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Thông báo về việc thay đổi mật khẩu',
        html: `
            <p>Chào bạn,</p>
            <p>Tài khoản của bạn vừa được thay đổi mật khẩu vào: ${changePasswordTime}. Nếu không phải bạn, hãy nhấn vào đường link bên dưới để có thể lấy lại mật khẩu bằng gmail!</p>
            <a href="${recoverLink}">${recoverLink}</a>
        `
    }

    return transporter.sendMail(mailOptions);
}

// Gửi mail thông báo đã được cấp quyền đối tác
async function sendNotificationApproveOwner(toEmail, ownerPage) {
    const mailOptions = {
        form: `BOOKING HOTEL <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Thông báo về việc chấp thuận đối tác!',
        html: `
            <p>Chào bạn,</p>
            <p>Chúc mừng bạn đã đăng kí đối tác thành công với chúng tôi! Click vào đường link bên dưới để đi dến trang quản lý của bạn</p>
            <a href="${ownerPage}">${ownerPage}</a>
        `
    }
    return transporter.sendMail(mailOptions);
}

// Gửi mail thông báo đã chấp thuận về khách sạn
async function sendNotificationApproveHotel(toEmail) {
    const mailOptions = {
        form: `BOOKING HOTEL <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Thông báo về việc chấp thuận khách sạn!',
        html: `
            <p>Chào bạn,</p>
            <p>Chúc mừng bạn đã đăng kí kinh doanh khách sạn thành công!</p>
        `
    }
    return transporter.sendMail(mailOptions);
}

// Gửi mail thông báo đặt phòng thành công
async function sendNotificationBookingConfirmed(toEmail, bookingInfo) {
    const mailOptions = {
        from: `BOOKING HOTEL <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: '✅ Đặt phòng của bạn đã được xác nhận thành công!',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #2b6cb0;">Xin chào,</h2>

                <p>Chúc mừng bạn! Đơn đặt phòng của bạn tại <strong>Booking Hotel</strong> đã được xác nhận thành công.</p>
                
                ${
                    bookingInfo
                        ? `
                        <div style="background-color: #f7fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-bottom: 8px; color: #2d3748;">Thông tin đặt phòng:</h3>
                            <ul style="list-style: none; padding-left: 0; color: #4a5568;">
                                <li><strong>Mã đặt phòng:</strong> ${bookingInfo.bookingCode || '—'}</li>
                                <li><strong>Khách sạn:</strong> ${bookingInfo.hotel.name || '—'}</li>
                                <li><strong>Loại phòng:</strong> ${bookingInfo.room.name || '—'}</li>
                                <li><strong>Ngày nhận phòng:</strong> ${bookingInfo.checkInDate || '—'}</li>
                                <li><strong>Ngày trả phòng:</strong> ${bookingInfo.checkOutDate || '—'}</li>
                                <li><strong>Tổng tiền:</strong> ${bookingInfo.pricing.totalPrice ? bookingInfo.pricing.totalPrice.toLocaleString('vi-VN') + ' ₫' : '—'}</li>
                            </ul>
                        </div>
                        `
                        : ''
                }

                <p>Chúng tôi rất mong được đón tiếp bạn trong thời gian sắp tới.  
                Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi qua email này.</p>

                <p>Trân trọng,<br><strong>Đội ngũ Booking Hotel</strong></p>

                <hr style="margin-top: 32px;">
                <small style="color: #777;">Đây là email tự động, vui lòng không phản hồi lại email này.</small>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
}


module.exports = { sendResetPassword, sendVerifyAccount, sendNotificationChangePassword, 
                sendNotificationApproveOwner, sendNotificationApproveHotel, sendNotificationBookingConfirmed };



