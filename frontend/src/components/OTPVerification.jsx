import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Alert } from 'reactstrap';
import { RefreshCw, Clock } from 'lucide-react';
import authService from '../data/Service/authService';

const OTPVerification = ({ userId, email, onSuccess, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Timer countdown
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (otpValue = otp.join('')) => {
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authService.verifyLoginOTP(userId, otpValue);
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        onSuccess(response);
      }, 1500);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      if (error.response) {
        setError(error.response.data.message || 'Invalid OTP');
      } else {
        setError('Network error. Please try again.');
      }
      // Clear OTP inputs on error
      setOtp(['', '', '', '', '', '']);
      const firstInput = document.getElementById('otp-0');
      if (firstInput) firstInput.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await authService.resendOTP(userId);
      setSuccess('New OTP sent to your email');
      setTimer(600); // Reset timer
      setCanResend(false);
      setOtp(['', '', '', '', '', '']); // Clear current OTP
      const firstInput = document.getElementById('otp-0');
      if (firstInput) firstInput.focus();
    } catch (error) {
      console.error('Error resending OTP:', error);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-blue-200"
    >
      {/* Header - Remove the lock emoji */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-blue-800 mb-2">Verify OTP</h2>
        <p className="text-blue-600 text-sm">
          Enter the 6-digit code sent to
          <br />
          <span className="font-semibold text-blue-700">{email}</span>
        </p>
      </div>

      {/* Error and Success Messages */}
      {error && <Alert color="danger" className="mb-4">{error}</Alert>}
      {success && <Alert color="success" className="mb-4">{success}</Alert>}

      {/* OTP Input Fields */}
      <div className="flex justify-center space-x-3 mb-4">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-12 text-center text-2xl font-bold border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
            disabled={loading}
          />
        ))}
      </div>

      {/* Timer */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center text-blue-600 mb-2">
          <Clock className="mr-2" size={16} />
          <span className="text-sm">
            {timer > 0 ? `Code expires in ${formatTime(timer)}` : 'Code expired'}
          </span>
        </div>
      </div>

      {/* Verify Button */}
      <button
        onClick={() => handleSubmit()}
        disabled={loading || otp.some(digit => digit === '')}
        className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mb-3"
      >
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>

      {/* Resend Button */}
      <button
        onClick={handleResend}
        disabled={!canResend || resendLoading}
        className="w-full text-blue-600 hover:text-blue-800 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mb-3"
      >
        <RefreshCw className={`mr-2 ${resendLoading ? 'animate-spin' : ''}`} size={16} />
        {resendLoading ? 'Sending...' : canResend ? 'Resend OTP' : `Resend in ${formatTime(timer)}`}
      </button>

      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={loading}
        className="w-full text-gray-600 hover:text-gray-800 transition"
      >
        Back to Login
      </button>
    </motion.div>
  );
};

export default OTPVerification;