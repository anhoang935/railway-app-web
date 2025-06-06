import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Shield, Lock, Award } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const TransactionBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [bookingData, setBookingData] = useState(null);
  const [passengerInfo, setPassengerInfo] = useState(null);

  useEffect(() => {
    if (location.state?.bookingData && location.state?.passengerInfo) {
      setBookingData(location.state.bookingData);
      setPassengerInfo(location.state.passengerInfo);
    } else {
      navigate('/checkout'); // Redirect if no data
    }
  }, [location, navigate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : v;
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiry(e.target.value);
    setExpiry(formatted);
  };

  const handlePayment = async () => {
    try {
      // Here you would typically integrate with a payment gateway
      // For now, we'll simulate a successful payment
      const paymentData = {
        cardNumber,
        expiry,
        cvc,
        cardholderName,
        amount: bookingData?.totalPrice
      };

      // Navigate back to checkout with payment success status
      navigate('/checkout', {
        state: {
          paymentSuccess: true,
          paymentData,
          bookingData,
          passengerInfo,
          returnToStep: 3,
          paymentStatus: 'paid'
        }
      });
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  if (!bookingData || !passengerInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <button 
              onClick={() => navigate('/checkout', {
                state: {
                  returnToStep: 2,
                  bookingData,
                  passengerInfo
                }
              })}
              className="flex items-center text-blue-600 hover:text-blue-700 mb-4 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Booking Details
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Payment Details</h1>
          </div>

          {/* Booking Summary */}
          <div className="p-6 bg-blue-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Booking Summary</h3>
                <p className="text-sm text-gray-600">{passengerInfo.fullName}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-blue-600">
                  {formatCurrency(bookingData.totalPrice)}
                </div>
                <div className="text-sm text-gray-600">Total Amount</div>
              </div>
            </div>
          </div>

          {/* Card Information */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Card Information</h3>
              </div>
              <div className="flex items-center text-green-600 text-sm font-medium">
                <Shield className="w-4 h-4 mr-1" />
                Secure Payment
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Cardholder Name"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-gray-50"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Card Number"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  maxLength="19"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-gray-50"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={handleExpiryChange}
                  maxLength="5"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-gray-50"
                />
                <input
                  type="text"
                  placeholder="CVC"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 4))}
                  maxLength="4"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(bookingData.totalPrice)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-semibold text-blue-600 text-xl">
                  {formatCurrency(bookingData.totalPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Pay Button */}
          <div className="p-6">
            <button 
              onClick={handlePayment}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
            >
              <Lock className="w-5 h-5 mr-2" />
              Pay Securely
            </button>
          </div>
        </div>

        {/* Security Features */}
        <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-gray-600">
          <div className="flex items-center">
            <Shield className="w-4 h-4 mr-1" />
            Secure Payment
          </div>
          <div className="flex items-center">
            <Lock className="w-4 h-4 mr-1" />
            SSL Encrypted
          </div>
          <div className="flex items-center">
            <Award className="w-4 h-4 mr-1" />
            Best Price Guarantee
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionBooking;