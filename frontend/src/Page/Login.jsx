import 'tailwindcss/tailwind.css'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Container, Row, Col, Form, Alert } from "reactstrap";
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import authService from '../data/Service/authService';
import OTPVerification from '../components/OTPVerification';
import LoadingPage from '../components/LoadingPage';
import '../styles/login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const [isVisible, setIsVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [snowflakes, setSnowflakes] = useState([]);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [loginData, setLoginData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);

    // Check if user is already logged in
    if (authService.isAuthenticated()) {
      navigate('/home');
      return;
    }

    // Check for remembered credentials
    const storedEmail = localStorage.getItem('email');
    const storedPassword = localStorage.getItem('password');
    const storedRememberMe = localStorage.getItem('rememberMe') === 'true';

    if (storedRememberMe && storedEmail && storedPassword) {
      setCredentials({
        email: storedEmail,
        password: storedPassword
      });
      setRememberMe(true);
    }

    const createSnowflakes = () => {
      const newSnowflakes = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 10 + 5}s`,
        size: `${Math.random() * 5 + 2}px`,
        delay: `${Math.random() * 5}s`
      }));
      setSnowflakes(newSnowflakes);
    };

    createSnowflakes();
  }, [navigate]);

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    // Clear errors when user starts typing
    if (error) setError(null);
  };

  const handleClick = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    setLoadingMessage('Checking credentials, please wait...');

    try {
      // Validate input
      if (!credentials.email || !credentials.password) {
        throw new Error('Please fill in all fields');
      }

      // Call login API
      const response = await authService.login(credentials);

      if (response.success && response.requiresOTP) {
        // Show OTP verification step
        setLoginData(response.data);
        setShowOTPVerification(true);
        setLoading(false);
        setLoadingMessage('');
        setSuccess('OTP sent to your email. Please check your inbox.');
      } else if (response.success) {
        // Direct login (fallback for backward compatibility)
        setSuccess('Login successful! Welcome back.');
        setLoadingMessage('Success! Redirecting...');

        setTimeout(() => {
          setLoading(false);
          navigate('/home');
        }, 2000);
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setLoading(false);
      setLoadingMessage('');

      if (error.response) {
        switch (error.response.status) {
          case 400:
            setError('Please fill in all required fields');
            break;
          case 401:
            setError(error.response.data.message || 'Invalid email or password');
            break;
          case 500:
            setError('Server error. Please try again later.');
            break;
          default:
            setError('Login failed. Please try again.');
        }
      } else if (error.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError(error.message || 'Login failed. Please try again.');
      }
    }
  };

  const handleOTPSuccess = (response) => {
    // Handle remember me
    if (rememberMe) {
      localStorage.setItem('email', credentials.email);
      localStorage.setItem('password', credentials.password);
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('email');
      localStorage.removeItem('password');
      localStorage.setItem('rememberMe', 'false');
    }

    // Debug the response structure
    console.log('OTP Success Response:', response);
    console.log('Response data:', response.data);
    console.log('User data:', response.data?.user);
    console.log('User role:', response.data?.user?.Role);

    if (response.data && response.data.user) {
      const userRole = response.data.user.Role || 'Customer';

      // Show loading page immediately
      setLoading(true);
      setLoadingMessage('Authentication successful! Setting up your account...');

      // First delay - prepare authentication data
      setTimeout(() => {
        setLoadingMessage('Preparing your dashboard...');

        // Store role in localStorage
        localStorage.setItem('userRole', userRole);
        console.log('Stored user role in localStorage:', userRole);

        // Second delay - finalize and redirect
        setTimeout(() => {
          if (userRole === 'Admin') {
            setLoadingMessage('Redirecting to Admin Panel...');
            setTimeout(() => {
              setLoading(false);
              navigate('/admin');
            }, 800);
          } else {
            setLoadingMessage('Redirecting to Home...');
            setTimeout(() => {
              setLoading(false);
              navigate('/home');
            }, 800);
          }
        }, 1000);
      }, 1000);
    } else {
      // Fallback to home if no role data
      setLoading(true);
      setLoadingMessage('Authentication successful! Redirecting...');
      setTimeout(() => {
        setLoading(false);
        navigate('/home');
      }, 2000);
    }
  };

  const handleBackToLogin = () => {
    setShowOTPVerification(false);
    setLoginData(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <>
      {loading && (
        <LoadingPage message={loadingMessage} />
      )}
      {!loading && (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
          {/* Animated floating elements */}
          {snowflakes.map((snowflake) => (
            <div
              key={snowflake.id}
              className="absolute text-blue-200 animate-pulse"
              style={{
                left: snowflake.left,
                animationDuration: snowflake.animationDuration,
                animationDelay: snowflake.delay,
                fontSize: snowflake.size,
              }}
            >
              ❄
            </div>
          ))}

          {/* Use a simple centered container without affecting other pages */}
          <div className="w-full max-w-md">
            {showOTPVerification ? (
              <OTPVerification
                userId={loginData.userId}
                email={loginData.email}
                onSuccess={handleOTPSuccess}
                onBack={handleBackToLogin}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full border border-blue-200"
              >
                <div className="text-center mb-6">
                  <div className="flex justify-center items-center mb-4">
                    <h1 className="text-3xl font-bold text-blue-800">Welcome back to TABB!</h1>
                  </div>
                  <p className="text-blue-600">Sign in to your account</p>
                </div>

                {error && <Alert color="danger" className="mb-4">{error}</Alert>}
                {success && <Alert color="success" className="mb-4">{success}</Alert>}

                <Form onSubmit={handleClick}>
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="text-blue-500" size={20} />
                      </div>
                      <input
                        type="email"
                        placeholder="Email Address"
                        required
                        id="email"
                        value={credentials.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="text-blue-500" size={20} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        required
                        id="password"
                        value={credentials.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="remember-me"
                          checked={rememberMe}
                          onChange={() => setRememberMe(!rememberMe)}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="remember-me" className="text-blue-600">Remember me</label>
                      </div>

                      <Link to='/forgot-password' className="text-blue-600 hover:underline">
                        Forgot password?
                      </Link>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Log in'}
                    </button>
                  </div>
                </Form>

                <div className="text-center mt-4">
                  <p className="text-blue-600">
                    Don't have an account?
                    <Link to='/register' className="ml-1 hover:underline font-bold">
                      Sign Up
                    </Link>
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Login;