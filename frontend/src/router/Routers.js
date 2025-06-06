import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from '../Page/Home'
import Buy_Ticket from '../Page/Buy_Ticket'
import Check_Ticket from '../Page/Check_Ticket'
import Return_Ticket from '../Page/Return_Ticket'
import About from '../Page/About'
import Login from '../Page/Login'
import Register from '../Page/Register'
import Timetable from '../Page/Timetable'
import Forgot_Password from '../Page/Forgot_Password'
import Settings from "../Page/Settings/Settings"
import Admin from "../Page/Admin/Admin"
import Checkout from '../Page/Checkout'
import EmailVerification from "../Page/Verification/EmailVerification"
import ProtectedRoute from './ProtectedRoute';
import authService from "../data/Service/authService";
import MyBooking from '../Page/MyBooking/MyBooking';
import TransactionBooking from '../Page/TransactionBooking'
const AdminRoute = ({ children }) => {
  const userRole = localStorage.getItem('userRole');
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (userRole !== 'Admin') {
    return <Navigate to="/home" />;
  }

  return children;
};

const Routers = () => {
  return (
    <Routes>
      <Route path='/' element={<Navigate to='/home' />} />
      <Route path='/home' element={<Home />} />
      <Route path='/about' element={<About />} />
      <Route path='/timetable' element={<Timetable />} />
      <Route path='/buy-ticket' element={<Buy_Ticket />} />
      <Route path='/check-ticket' element={<Check_Ticket />} />
      <Route path='/return-ticket' element={<Return_Ticket />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/forgot-password' element={<Forgot_Password />} />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      <Route path='/checkout' element={<Checkout />} />
      <Route path="/verify-email" element={<EmailVerification />} />
      <Route path="/my-bookings" element={<MyBooking />} />
      <Route path="/transaction" element={<TransactionBooking />} />
    </Routes>
  )
}

export default Routers