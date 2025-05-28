import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Alert } from "reactstrap";
import { useNavigate, useLocation } from 'react-router-dom';
import { Key, Clock, RefreshCw } from 'lucide-react';
import authService from "../../data/Service/authService";

const EmailVerification = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [timer, setTimer] = useState(600);    // 10 minutes 
    const [canResend, setCanResend] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { userId, email } = location.state || {};
    const inputRefsContainer = useRef([]);

    useEffect(() => {
        setIsVisible(true);

        if (!userId || !email) {
            navigate('/login', { replace: true });
        }

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
    }, [userId, email, navigate]);

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

        if (value && index < 5) {
            inputRefsContainer.current[index + 1].focus();
        }

        if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
            handleSubmit(newOtp.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefsContainer.current[index - 1].focus();
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
            const response = await authService.verifyEmail(userId, otpValue);
            setSuccess(response.message || 'Email verified successfully!');

            setTimeout(() => {
                navigate('/login', { state: { verificationSuccess: true } });
            }, 3000);
        } catch (error) {
            console.error('Verification error:', error);

            if (error.response) {
                setError(error.response.data.message || 'Invalid verification code');
            } else {
                setError('Network error. Please try again.');
            }

            setOtp(['', '', '', '', '', '']);
            inputRefsContainer.current[0].focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!canResend && timer > 0) return;

        setResendLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await authService.resendVerificationCode(userId);
            setSuccess(response.message || 'Verification code resent to your email');

            setTimer(600);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            inputRefsContainer.current[0].focus();
        } catch (error) {
            console.error('Error resending code:', error);
            setError('Failed to resend verification code. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-white bg-opacity-80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md z-10 border-4 border-blue-300 -mt-16"
            >
                <div className="text-center mb-6">
                    <div className="flex justify-center items-center mb-4">
                        <Key className="text-blue-600 mr-2" size={32} />
                        <h1 className="text-3xl font-bold text-blue-800">Verify OTP</h1>
                    </div>
                    <p className="text-blue-600">
                        Enter the 6-digit code sent to<br />
                        <strong>{email}</strong>
                    </p>
                </div>

                {error && <Alert color="danger" className="mb-4">{error}</Alert>}
                {success && <Alert color="success" className="mb-4">{success}</Alert>}

                <div className="space-y-6">
                    <div className="flex justify-center space-x-3">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputRefsContainer.current[index] = el}
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

                    <div className="text-center">
                        <div className="flex items-center justify-center text-blue-600 mb-2">
                            <Clock className="mr-2" size={16} />
                            <span className="text-sm">
                                Code expires in {formatTime(timer)}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => handleSubmit()}
                        disabled={loading || otp.some(digit => digit === '')}
                        className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>

                    <button
                        onClick={handleResendCode}
                        disabled={!canResend && timer > 0 || resendLoading}
                        className="w-full text-blue-600 hover:text-blue-800 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw className={`mr-2 ${resendLoading ? 'animate-spin' : ''}`} size={16} />
                        {resendLoading
                            ? 'Sending...'
                            : canResend
                                ? 'Resend OTP'
                                : `Resend in ${formatTime(timer)}`
                        }
                    </button>

                    <button
                        onClick={handleBackToLogin}
                        className="w-full text-gray-600 hover:text-gray-800 transition"
                    >
                        Back to Login
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default EmailVerification;