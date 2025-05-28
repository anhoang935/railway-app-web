import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/Users.js';
import { sendVerificationEmail, sendOTPEmail } from '../utils/emailService.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  });
};

export const register = async (req, res) => {
  try {
    const { UserName, Email, Password, Gender, PhoneNumber } = req.body;

    const validationErrors = [];

    if (UserName.length < 2) {
      validationErrors.push("Name must be at least 2 characters long");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
      validationErrors.push("Please enter a valid email address");
    }

    if (PhoneNumber) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(PhoneNumber)) {
        validationErrors.push("Phone number must be 10 digits long");
      }
    }

    if (Password.length < 8) {
      validationErrors.push("Password must be at least 8 characters long");
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(Password)) {
      validationErrors.push("Password must include uppercase, lowercase, number, and special character");
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: validationErrors.join(". ")
      });
    }

    const existingUserByEmail = await User.findByEmail(Email);
    if (existingUserByEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

    const existingUserByUsername = await User.findByUsername(UserName);
    if (existingUserByUsername) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists'
      });
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(Password, saltRounds);

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    const userData = {
      UserName,
      Email,
      Password: hashedPassword,
      Gender,
      PhoneNumber,
      VerifyCode: verifyCode,
      Status: 'pending'
    };

    const newUser = await User.create(userData);

    try {
      await sendVerificationEmail(Email, verifyCode);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      data: {
        userId: newUser.userID,
        username: newUser.UserName,
        email: newUser.Email,
        gender: newUser.Gender,
        phone: newUser.PhoneNumber,
        status: newUser.Status
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Login user - Modified to include OTP
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (user.Status !== 'verified' && user.Status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.Password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate and send OTP
    const otp = await User.generateOTP(user.userID);
    await sendOTPEmail(user.Email, otp, user.UserName);

    // Send response (don't include token yet)
    res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete login.',
      requiresOTP: true,
      data: {
        userId: user.userID,
        email: user.Email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Verify OTP - Second step of login
export const verifyLoginOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'User ID and OTP are required'
      });
    }

    // Verify OTP
    await User.verifyOTP(userId, otp);

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate token after successful OTP verification
    const token = generateToken(user.userID);

    // Send response with token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          userId: user.userID,
          username: user.UserName,
          email: user.Email,
          status: user.Status
        },
        token
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Invalid OTP'
    });
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate and send new OTP
    const otp = await User.generateOTP(user.userID);
    await sendOTPEmail(user.Email, otp, user.UserName);

    res.status(200).json({
      success: true,
      message: 'New OTP sent to your email'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP'
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { userId, verifyCode } = req.body;

    if (!userId || !verifyCode) {
      return res.status(400).json({
        success: false,
        message: 'User ID and verification code are required'
      });
    }

    const result = await User.verifyEmail(userId, verifyCode);

    if (result) {
      res.status(200).json({
        success: true,
        message: 'Email verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    await User.update(user.userID, { VerifyCode: resetCode });

    try {
      await sendVerificationEmail(user.Email, resetCode);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset code sent to your email',
      resetCode: resetCode
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, verifyCode, newPassword } = req.body;

    if (!email || !verifyCode || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, verification code, and new password are required'
      });
    }

    const user = await User.findByEmail(email);
    if (!user || user.VerifyCode !== verifyCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await User.update(user.userID, {
      Password: hashedPassword,
      VerifyCode: null
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const resendVerificationCode = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    await User.update(userId, { VerifyCode: verifyCode });

    try {
      await sendVerificationEmail(user.Email, verifyCode);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError.message);
      console.error('Error details:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email: ' + emailError.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'New verification code sent to your email'
      // Remove this in production - only for testing
      // resetCode: verifyCode
    });
  } catch (error) {
    console.error('Resend verification code error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};