import User from '../models/Users.js';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    
    // Remove passwords from response for security
    const safeUsers = users.map(user => {
      const { Password, ...safeUser } = user;
      return safeUser;
    });
    
    res.status(200).json({
      success: true,
      count: safeUsers.length,
      data: safeUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get a single user
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Remove password from response for security
    const { Password, ...safeUser } = user;
    
    res.status(200).json({
      success: true,
      data: safeUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user by email
export const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Remove password from response for security
    const { Password, ...safeUser } = user;
    
    res.status(200).json({
      success: true,
      data: safeUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get users by status
export const getUsersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const users = await User.findByStatus(status);
    
    // Remove passwords from response for security
    const safeUsers = users.map(user => {
      const { Password, ...safeUser } = user;
      return safeUser;
    });
    
    res.status(200).json({
      success: true,
      count: safeUsers.length,
      data: safeUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const stats = await User.getUserStats();
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create a new user
export const createUser = async (req, res) => {
  try {
    let userData;
    
    // If content type is text/plain, try to parse it as JSON
    if (req.headers['content-type'] === 'text/plain') {
      try {
        userData = JSON.parse(req.body);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON in text/plain body'
        });
      }
    } else {
      // Otherwise use the parsed body directly
      userData = req.body;
    }
    
    const { UserName, Email, Password, VerifyCode, Status } = userData;
    
    if (!UserName || !Email || !Password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide UserName, Email, and Password'
      });
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    const user = await User.create({
      UserName,
      Email,
      Password,
      VerifyCode,
      Status
    });
    
    // Remove password from response for security
    const { Password: _, ...safeUser } = user;
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: safeUser
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update a user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    let userData;
    
    // If content type is text/plain, try to parse it as JSON
    if (req.headers['content-type'] === 'text/plain') {
      try {
        userData = JSON.parse(req.body);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON in text/plain body'
        });
      }
    } else {
      // Otherwise use the parsed body directly
      userData = req.body;
    }
    
    const updatedUser = await User.update(id, userData);
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Remove password from response for security
    const { Password, ...safeUser } = updatedUser;
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: safeUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    try {
      const deleted = await User.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      // If error is about associated bookings
      if (error.message.includes('associated bookings')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      throw error;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user's bookings
export const getUserBookings = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const bookings = await User.getUserBookings(id);
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Verify user email
export const verifyUserEmail = async (req, res) => {
  try {
    const { id } = req.params;
    let verificationData;
    
    // If content type is text/plain, try to parse it as JSON
    if (req.headers['content-type'] === 'text/plain') {
      try {
        verificationData = JSON.parse(req.body);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON in text/plain body'
        });
      }
    } else {
      // Otherwise use the parsed body directly
      verificationData = req.body;
    }
    
    const { verifyCode } = verificationData;
    
    if (!verifyCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide verification code'
      });
    }
    
    const result = await User.verifyEmail(id, verifyCode);
    
    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update user password
export const updateUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    let passwordData;
    
    // If content type is text/plain, try to parse it as JSON
    if (req.headers['content-type'] === 'text/plain') {
      try {
        passwordData = JSON.parse(req.body);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON in text/plain body'
        });
      }
    } else {
      // Otherwise use the parsed body directly
      passwordData = req.body;
    }
    
    const { newPassword } = passwordData;
    
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide new password'
      });
    }
    
    const updated = await User.updatePassword(id, newPassword);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};