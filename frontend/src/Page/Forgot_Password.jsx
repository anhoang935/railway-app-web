import 'tailwindcss/tailwind.css'
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Form, Alert } from "reactstrap";
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import '../styles/forgot_password.css';

const Forgot_Password = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Simulate API call
    setTimeout(() => {
      if (email === "test@example.com") {
        setSuccess("Password reset link has been sent to your email.");
      } else {
        setError("Email not found.");
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white bg-opacity-80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md z-10 border-4 border-blue-300"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800">Forgot Password</h1>
          <p className="text-blue-600">Enter your email to reset your password</p>
        </div>

        {error && <Alert color="danger" className="mb-4">{error}</Alert>}
        {success && <Alert color="success" className="mb-4">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
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
              className="w-full bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 transition flex items-center justify-center mt-4"
            >
              Send Reset Link
            </button>
          </div>
        </Form>

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