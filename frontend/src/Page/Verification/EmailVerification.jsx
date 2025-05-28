import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Form, Alert } from "reactstrap";
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Key, CheckCircle } from 'lucide-react';
import authService from "../../data/Service/authService";

const EmailVerification = () => {
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { userId, email } = location.state || {};

    useEffect(() => {
        setIsVisible(true);

        // If no user details are provided, redirect to login
        if (!userId || !email) {
            navigate('/login', { replace: true });
        }
    }, [userId, email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            // Call verify email API
            const response = await authService.verifyEmail(userId, verificationCode);

            setSuccess(response.message || 'Email verified successfully!');

            // Redirect to login after success
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
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            // Call resend verification code API (you'll need to implement this)
            const response = await authService.resendVerificationCode(userId);
            setSuccess(response.message || 'Verification code resent to your email');
        } catch (error) {
            console.error('Error resending code:', error);
            setError('Failed to resend verification code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white flex flex-col p-4 pt-28 relative overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-white bg-opacity-80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md z-10 border-4 border-blue-300 mx-auto mt-3"
            >
                <div className="text-center mb-6">
                    <div className="flex justify-center items-center mb-4">
                        <CheckCircle className="text-blue-600 mr-2" size={40} />
                        <h1 className="text-3xl font-bold text-blue-800">Verify Your Email</h1>
                    </div>
                    <p className="text-blue-600">Please enter the verification code sent to {email}</p>
                </div>

                {error && <Alert color="danger" className="mb-4">{error}</Alert>}
                {success && <Alert color="success" className="mb-4">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Key className="text-blue-500" size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Verification Code"
                                required
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border-2 border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 transition flex items-center justify-center mt-4 disabled:opacity-50"
                        >
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </button>

                        <div className="text-center mt-4">
                            <button
                                type="button"
                                onClick={handleResendCode}
                                disabled={loading}
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                Didn't receive a code? Resend
                            </button>
                        </div>
                    </div>
                </Form>
            </motion.div>
        </div>
    );
};

export default EmailVerification;