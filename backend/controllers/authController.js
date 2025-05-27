import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/Users.js';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  });
};

// Register user
export const register = async (req, res) => {
  try {
    const { UserName, Email, Password } = req.body;

    // Check if user already exists
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

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(Password, saltRounds);

    // Generate verification code
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create user
    const userData = {
      UserName,
      Email,
      Password: hashedPassword,
      VerifyCode: verifyCode,
      Status: 'pending' // User needs email verification
    };

    const newUser = await User.create(userData);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      data: {
        userId: newUser.userID,
        username: newUser.UserName,
        email: newUser.Email,
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

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is verified
    if (user.Status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.Password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user.userID);

    // Send response
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
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Verify email
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

// Reset password
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

    // Generate new verification code for password reset
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Update user with reset code
    await User.update(user.userID, { VerifyCode: resetCode });

    // In a real app, you would send this code via email
    res.status(200).json({
      success: true,
      message: 'Password reset code sent to your email',
      // Remove this in production - only for testing
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

// Reset password with code
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

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear verification code
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