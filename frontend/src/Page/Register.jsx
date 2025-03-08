import 'tailwindcss/tailwind.css'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Container, Row, Col, Form, FormGroup, Button, Alert } from "reactstrap";
import { Link, useNavigate } from 'react-router-dom';
import { Gift, User, Lock, Mail, Eye, EyeOff, Phone } from 'lucide-react';
import '../styles/register.css';

const Register = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white flex items-center justify-center p-4 relative overflow-hidden">

      {/* Main Register Card */}
      <motion.div
        // initial={{ opacity: 0, y: 20 }}
        // animate={{ opacity: isVisible ? 1 : 0, y: 0 }}
        // transition={{ duration: 0.8 }}
        className="bg-white bg-opacity-80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md z-10 border-4 border-blue-300 mt-14"
      >
        <div className="text-center mb-6">
          <div className="flex justify-center items-center mb-4">
            <Gift className="text-blue-600 mr-2" size={40} />
            <h1 className="text-3xl font-bold text-blue-800">Create Account</h1>
          </div>
          <p className="text-blue-600">TAB into the Holiday Spirit!</p>
        </div>

        {/* Error and Success Alerts */}
        {/* {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert color="danger" className="mb-4">{error}</Alert>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert color="success" className="mb-4">{success}</Alert>
          </motion.div>
        )} */}

        {/* <Form onSubmit={handleSubmit}> */}
          <div className="space-y-4">
            {/* Name Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="text-blue-500" size={20} />
              </div>
              <input
                type="text"
                id="name"
                placeholder="Full Name"
                // value={formData.name}
                // onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
              />
            </div>

            {/* Gender Select */}
            <div className="relative">
              <select
                id="gender"
                // value={formData.gender}
                // onChange={handleChange}
                required
                className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 text-gray-700"
              >
                <option value="">Select Gender</option>
                {/* {genderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))} */}
              </select>
            </div>

            {/* Email Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="text-blue-500" size={20} />
              </div>
              <input
                type="email"
                id="email"
                placeholder="Email Address"
                // value={formData.email}
                // onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
              />
            </div>

            {/* Phone Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="text-blue-500" size={20} />
              </div>
              <input
                type="tel"
                id="phone"
                placeholder="Phone Number"
                // value={formData.phone}
                // onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="text-blue-500" size={20} />
              </div>
              <input
                // type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Password"
                // value={formData.password}
                // onChange={handleChange}
                required
                className="w-full pl-10 pr-10 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
              />
              <button
                type="button"
                // onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-500"
              >
                {/* {showPassword ? <EyeOff size={20} /> : <Eye size={20} />} */}
              </button>
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="text-blue-500" size={20} />
              </div>
              <input
                // type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="Confirm Password"
                // value={formData.confirmPassword}
                // onChange={handleChange}
                required
                className="w-full pl-10 pr-10 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
              />
              <button
                type="button"
                // onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-500"
              >
                {/* {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />} */}
              </button>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center"
            >
              <Gift className="mr-2" size={20} />
              Create Account
            </motion.button>
          </div>
        {/* </Form> */}

        {/* Login Link */}
        <div className="text-center mt-4">
          <p className="text-blue-600">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-blue-800 font-bold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Register