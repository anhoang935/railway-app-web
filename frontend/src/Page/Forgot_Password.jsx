import 'tailwindcss/tailwind.css'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Form, Alert } from "reactstrap";
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Key } from 'lucide-react';
import authService from '../data/Service/authService';
import '../styles/forgot_password.css';

const Forgot_Password = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      setSuccess(response.message || 'Reset code sent to your email');
      setStep(2);
      
      // For demo purposes - remove in production
      if (response.resetCode) {
        console.log('Reset code (for demo):', response.resetCode);
        setSuccess(`Reset code sent! (Demo code: ${response.resetCode})`);
      }
    } catch (error) {
      console.error('Error sending reset email:', error);
      if (error.response) {
        setError(error.response.data.message || 'Failed to send reset email');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      await authService.resetPassword(email, verifyCode, newPassword);
      setSuccess('Password reset successfully! You can now login with your new password.');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Error resetting password:', error);
      if (error.response) {
        setError(error.response.data.message || 'Failed to reset password');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white bg-opacity-80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md z-10 border-4 border-blue-300"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800">
            {step === 1 ? 'Forgot Password' : 'Reset Password'}
          </h1>
          <p className="text-blue-600">
            {step === 1 
              ? 'Enter your email to reset your password' 
              : 'Enter the code and your new password'
            }
          </p>
        </div>

        {error && <Alert color="danger" className="mb-4">{error}</Alert>}
        {success && <Alert color="success" className="mb-4">{success}</Alert>}

        {step === 1 ? (
          <Form onSubmit={handleEmailSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-blue-500" size={20} />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border-2 border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 transition flex items-center justify-center mt-4 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </div>
          </Form>
        ) : (
          <Form onSubmit={handleResetSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="text-blue-500" size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Verification Code"
                  required
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border-2 border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                />
              </div>

              <div className="relative">
                <input
                  type="password"
                  placeholder="New Password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                />
              </div>

              <div className="relative">
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 transition flex items-center justify-center mt-4 disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-blue-600 hover:underline mt-2"
              >
                Back to Email
              </button>
            </div>
          </Form>
        )}

        <div className="text-center mt-4">
          <p className="text-blue-600">
            Remember your password?{' '}
            <Link to="/login" className="text-blue-800 font-bold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Forgot_Password;