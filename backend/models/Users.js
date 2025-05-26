import pool from '../Config/db.js';

class User {
  // Get all users
  static async findAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM user ORDER BY userID DESC');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get user by ID
  static async findById(userID) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM user WHERE userID = ?',
        [userID]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get user by email
  static async findByEmail(email) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM user WHERE Email = ?',
        [email]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get user by username
  static async findByUsername(username) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM user WHERE UserName = ?',
        [username]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get users by status
  static async findByStatus(status) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM user WHERE Status = ? ORDER BY userID DESC',
        [status]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Create new user
  static async create({ UserName, Email, Password, VerifyCode, Status }) {
    try {
      // Check if username already exists
      const existingUsername = await User.findByUsername(UserName);
      if (existingUsername) {
        throw new Error(`Username '${UserName}' already exists`);
      }

      // Check if email already exists
      const existingEmail = await User.findByEmail(Email);
      if (existingEmail) {
        throw new Error(`Email '${Email}' already exists`);
      }

      const [result] = await pool.query(
        'INSERT INTO user (UserName, Email, Password, VerifyCode, Status) VALUES (?, ?, ?, ?, ?)',
        [UserName, Email, Password, VerifyCode || null, Status || 'pending']
      );

      return {
        userID: result.insertId,
        UserName,
        Email,
        Password, // In production, you might want to exclude this
        VerifyCode,
        Status: Status || 'pending'
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Update user
  static async update(userID, userData) {
    try {
      const { UserName, Email, Password, VerifyCode, Status } = userData;

      // Check if user exists
      const existingUser = await User.findById(userID);
      if (!existingUser) {
        return null;
      }

      // Check if username is being changed and if it conflicts with another user
      if (UserName && UserName !== existingUser.UserName) {
        const usernameConflict = await User.findByUsername(UserName);
        if (usernameConflict && usernameConflict.userID !== userID) {
          throw new Error(`Username '${UserName}' already exists`);
        }
      }

      // Check if email is being changed and if it conflicts with another user
      if (Email && Email !== existingUser.Email) {
        const emailConflict = await User.findByEmail(Email);
        if (emailConflict && emailConflict.userID !== userID) {
          throw new Error(`Email '${Email}' already exists`);
        }
      }

      const [result] = await pool.query(
        `UPDATE user SET 
        UserName = COALESCE(?, UserName),
        Email = COALESCE(?, Email),
        Password = COALESCE(?, Password),
        VerifyCode = COALESCE(?, VerifyCode),
        Status = COALESCE(?, Status)
        WHERE userID = ?`,
        [
          UserName || null,
          Email || null,
          Password || null,
          VerifyCode !== undefined ? VerifyCode : null,
          Status || null,
          userID
        ]
      );

      if (result.affectedRows === 0) {
        return null;
      }

      // Return updated user data
      const updatedUser = await User.findById(userID);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user
  static async delete(userID) {
    try {
      // Check if user has associated bookings
      const [bookingCheck] = await pool.query(
        'SELECT * FROM booking WHERE userID = ?',
        [userID]
      );

      if (bookingCheck.length > 0) {
        throw new Error(`Cannot delete user with ID ${userID} as they have associated bookings`);
      }

      const [result] = await pool.query(
        'DELETE FROM user WHERE userID = ?',
        [userID]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get user's bookings
  static async getUserBookings(userID) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          b.*,
          p.fullname AS passengerName,
          p.phone_number AS passengerPhone,
          p.email AS passengerEmail
        FROM booking b
        LEFT JOIN passenger p ON b.passengerID = p.passengerID
        WHERE b.userID = ?
        ORDER BY b.bookingDate DESC
      `, [userID]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Verify user email with verification code
  static async verifyEmail(userID, verifyCode) {
    try {
      const user = await User.findById(userID);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.VerifyCode !== verifyCode) {
        throw new Error('Invalid verification code');
      }

      // Update user status to verified
      const [result] = await pool.query(
        'UPDATE user SET Status = ?, VerifyCode = NULL WHERE userID = ?',
        ['verified', userID]
      );

      if (result.affectedRows === 0) {
        throw new Error('Failed to verify user');
      }

      return { userID, status: 'verified' };
    } catch (error) {
      throw error;
    }
  }

  // Update password
  static async updatePassword(userID, newPassword) {
    try {
      const [result] = await pool.query(
        'UPDATE user SET Password = ? WHERE userID = ?',
        [newPassword, userID]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get user statistics
  static async getUserStats() {
    try {
      const [totalUsers] = await pool.query('SELECT COUNT(*) as total FROM user');
      const [verifiedUsers] = await pool.query('SELECT COUNT(*) as verified FROM user WHERE Status = "verified"');
      const [pendingUsers] = await pool.query('SELECT COUNT(*) as pending FROM user WHERE Status = "pending"');
      const [activeUsers] = await pool.query('SELECT COUNT(*) as active FROM user WHERE Status = "active"');

      return {
        total: totalUsers[0].total,
        verified: verifiedUsers[0].verified,
        pending: pendingUsers[0].pending,
        active: activeUsers[0].active
      };
    } catch (error) {
      throw error;
    }
  }
}

export default User;