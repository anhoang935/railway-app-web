import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Form, Alert } from "reactstrap";
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Eye, EyeOff, Phone, Calendar, Home } from 'lucide-react';
import authService from '../data/Service/authService';
import '../styles/register.css';

const Register = () => {
  const navigate = useNavigate();
  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
  ];

  const [formData, setFormData] = useState({
    UserName: "",
    Email: "",
    Password: "",
    Gender: "",
    PhoneNumber: "",
    DateOfBirth: "",
    Address: "",
  });

  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    setError(null);
    setSuccess(null);
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const validateForm = () => {
    const validationErrors = [];

    if (formData.UserName.length < 2) {
      validationErrors.push("Name must be at least 2 characters long");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.Email)) {
      validationErrors.push("Please enter a valid email address");
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.PhoneNumber)) {
      validationErrors.push("Phone number must be 10 digits long");
    }

    // Date of birth validation - ensure it's not in the future
    if (formData.dateOfBirth) {
      const today = new Date();
      const dob = new Date(formData.dateOfBirth);

      if (dob > today) {
        validationErrors.push("Date of birth cannot be in the future");
      }

      // Check if user is at least 10 years old (arbitrary minimum age)
      const minAgeDate = new Date();
      minAgeDate.setFullYear(today.getFullYear() - 10);
      if (dob > minAgeDate) {
        validationErrors.push("You must be at least 10 years old to register");
      }
    }

    if (formData.Password.length < 8) {
      validationErrors.push("Password must be at least 8 characters long");
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.Password)) {
      validationErrors.push("Password must include uppercase, lowercase, number, and special character");
    }

    if (formData.Password !== formData.confirmPassword) {
      validationErrors.push("Passwords do not match");
    }

    if (!formData.Gender) {
      validationErrors.push("Please select a gender");
    }

    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(". "));
      return;
    }

    try {
      const response = await authService.register(formData);
      setSuccess(response.message || 'Registration successful');

      if (response.data && response.data.userId) {
        // Navigate to OTP verification page with both userId and email in location state
        navigate('/verify-email', {
          state: {
            userId: response.data.userId,
            email: formData.Email
          }
        });
      } else {
        console.error('User ID not found in response');
        navigate('/login');
      }

      setFormData({
        UserName: "",
        Email: "",
        Password: "",
        Gender: "",
        PhoneNumber: "",
        DateOfBirth: "",
        Address: "",
      });
    } catch (error) {
      console.error('Error registering user:', error);
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setError(error.response.data.message || 'Invalid registration details');
            break;
          case 409:
            setError('Email already exists. Please use a different email.');
            break;
          case 500:
            setError('Server error. Please try again later.');
            break;
          default:
            setError('Registration failed. Please try again.');
        }
      } else if (error.request) {
        setError('No response from server. Please check your internet connection.');
      } else {
        setError('An unexpected error occurred during registration.');
      }
    }
  };

  const renderInput = (type, id, placeholder, icon, value, showToggle = false, showState = false, setShowState = null) => (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {icon}
      </div>
      <input
        type={showToggle ? (showState ? "text" : "password") : type}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        required
        className="w-full pl-10 pr-3 py-3 h-12 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
      />
      {showToggle && (
        <button
          type="button"
          onClick={() => setShowState(!showState)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-500"
        >
          {showState ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
      {error && error.includes(id) && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

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
            <h1 className="text-3xl font-bold text-blue-800">Create Account</h1>
          </div>
          <p className="text-blue-600">Welcome to the TABB Railways Corporation</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Alert color="danger" className="mb-4">{error}</Alert>
          </motion.div>
        )}

        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Alert color="success" className="mb-4">{success}</Alert>
          </motion.div>
        )}

        <Form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {renderInput("text", "UserName", "Full Name", <User className="text-blue-500" size={20} />, formData.UserName)}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="text-blue-500" size={20} />
              </div>
              <select
                id="Gender"
                value={formData.Gender}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-10 py-2 h-12 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 text-gray-700"
                style={{
                  appearance: 'none',
                  textOverflow: 'ellipsis',
                }}
              >
                <option value="">Select Gender</option>
                {genderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>

            {renderInput("email", "Email", "Email Address", <Mail className="text-blue-500" size={20} />, formData.Email)}
            {renderInput("tel", "PhoneNumber", "Phone Number", <Phone className="text-blue-500" size={20} />, formData.PhoneNumber)}

            {/* New Date of Birth Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="text-blue-500" size={20} />
              </div>
              <input
                type="date"
                id="DateOfBirth"
                placeholder="Date of Birth"
                value={formData.DateOfBirth}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-3 h-12 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 pb-2 flex items-center pointer-events-none">
                <Home className="text-blue-500" size={20} />
              </div>
              <textarea
                id="Address"
                placeholder="Address"
                value={formData.Address}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2.5 h-12 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 resize-none"
                style={{
                  boxSizing: 'border-box',
                  overflowY: 'auto',
                  lineHeight: '1.5'
                }}
              />
            </div>

            {renderInput("password", "Password", "Password", <Lock className="text-blue-500" size={20} />, formData.Password, true, showPassword, setShowPassword)}
            {renderInput("password", "confirmPassword", "Confirm Password", <Lock className="text-blue-500" size={20} />, formData.confirmPassword, true, showConfirmPassword, setShowConfirmPassword)}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center"
            >
              Create Account
            </motion.button>
          </div>
        </Form>

        <div className="text-center mt-4">
          <p className="text-blue-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-800 font-bold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;