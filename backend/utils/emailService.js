import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    secure: true,
    port: 465,
    tls: {
        rejectUnauthorized: false
    }
});

export const sendVerificationEmail = async (email, verificationCode) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify Your Email - TABB Railways Corporation',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #3b82f6; text-align: center;">TABB Railways Corporation</h1>
        <h2 style="color: #1e40af; text-align: center;">Email Verification</h2>
        <p>Thank you for registering with us. Please use the verification code below to complete your registration:</p>
        <div style="text-align: center; padding: 10px; background-color: #f0f9ff; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #3b82f6; letter-spacing: 5px;">${verificationCode}</h2>
        </div>
        <p>If you didn't request this verification, please ignore this email.</p>
      </div>
    `
    };

    await transporter.sendMail(mailOptions);
};