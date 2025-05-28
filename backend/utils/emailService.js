import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
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

// Function to send OTP email (new)
export const sendOTPEmail = async (email, otp, userName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'TAB Railway - Login Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0066ff;">TAB Railway</h1>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-bottom: 15px;">Login Verification Code</h2>
            <p style="color: #666; margin-bottom: 15px;">Hello ${userName},</p>
            <p style="color: #666; margin-bottom: 20px;">
              You have requested to login to your TAB Railway account. Please use the following verification code:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background-color: #0066ff; color: white; padding: 15px 30px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 3px;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #666; margin-bottom: 10px;">
              <strong>Important:</strong> This code will expire in 10 minutes.
            </p>
            <p style="color: #666;">
              If you didn't request this code, please ignore this email or contact our support team.
            </p>
          </div>
          
          <div style="text-align: center; color: #999; font-size: 12px;">
            <p>This is an automated message from TAB Railway. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent successfully to: ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};