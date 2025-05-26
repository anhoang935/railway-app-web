import React, { useState, useEffect } from 'react';
import { CreditCard, User, Mail, Phone, MapPin, Calendar, Clock, Train, Bed, Users, CheckCircle, AlertCircle } from 'lucide-react';

const Checkout = ({ bookingData, onBack, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  const [passengerInfo, setPassengerInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    idNumber: '',
    dateOfBirth: '',
    address: ''
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: ''
  });

  const [errors, setErrors] = useState({});

  // Mock data for when bookingData is not provided
  const defaultBookingData = {
    train: { id: 'SE1', direction: 'Bắc-Nam', startTime: '12:00', endTime: '04:00', duration: 16 },
    coach: { id: 'room-4-bed', name: 'Room 4 beds, Air-Con', price: 1200000, type: 'bed' },
    from: 'hanoi',
    to: 'saigon',
    fromName: 'Hà Nội',
    toName: 'Sài Gòn',
    departureDate: '2025-06-01',
    returnDate: '2025-06-05',
    tripType: 'round-trip',
    selectedItems: [
      { key: '0-1', row: 0, col: 1, price: 1200000 },
      { key: '1-1', row: 1, col: 1, price: 1200000 }
    ],
    totalPrice: 4800000,
    distance: 1000
  };

  const booking = bookingData || defaultBookingData;

  const majorStations = [
    { id: 'hanoi', name: 'Hà Nội' },
    { id: 'vinh', name: 'Vinh' },
    { id: 'hue', name: 'Huế' },
    { id: 'danang', name: 'Đà Nẵng' },
    { id: 'nhatrang', name: 'Nha Trang' },
    { id: 'saigon', name: 'Sài Gòn' }
  ];

  const getStationName = (stationId) => {
    return majorStations.find(s => s.id === stationId)?.name || stationId;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatTime = (timeStr) => {
    return timeStr.replace(':', 'h');
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!passengerInfo.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!passengerInfo.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(passengerInfo.email)) newErrors.email = 'Email is invalid';
    if (!passengerInfo.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[0-9]{10,11}$/.test(passengerInfo.phone.replace(/\s/g, ''))) newErrors.phone = 'Phone number is invalid';
    if (!passengerInfo.idNumber.trim()) newErrors.idNumber = 'ID number is required';
    if (!passengerInfo.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    if (paymentMethod === 'cash') return true;
    
    const newErrors = {};
    
    if (!paymentInfo.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
    else if (!/^[0-9]{16}$/.test(paymentInfo.cardNumber.replace(/\s/g, ''))) newErrors.cardNumber = 'Card number must be 16 digits';
    
    if (!paymentInfo.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
    else if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(paymentInfo.expiryDate)) newErrors.expiryDate = 'Format: MM/YY';
    
    if (!paymentInfo.cvv.trim()) newErrors.cvv = 'CVV is required';
    else if (!/^[0-9]{3,4}$/.test(paymentInfo.cvv)) newErrors.cvv = 'CVV must be 3-4 digits';
    
    if (!paymentInfo.cardholderName.trim()) newErrors.cardholderName = 'Cardholder name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (section, field, value) => {
    if (section === 'passenger') {
      setPassengerInfo(prev => ({ ...prev, [field]: value }));
    } else if (section === 'payment') {
      setPaymentInfo(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCardNumberChange = (value) => {
    // Format card number with spaces
    const formatted = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
    handleInputChange('payment', 'cardNumber', formatted);
  };

  const handleExpiryDateChange = (value) => {
    // Format expiry date MM/YY
    let formatted = value.replace(/\D/g, '');
    if (formatted.length >= 2) {
      formatted = formatted.substring(0, 2) + '/' + formatted.substring(2, 4);
    }
    handleInputChange('payment', 'expiryDate', formatted);
  };

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const processPayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsProcessing(false);
    setCurrentStep(4); // Success step
    
    // Call onComplete callback if provided
    if (onComplete) {
      onComplete({
        bookingData: booking,
        passengerInfo,
        paymentInfo: paymentMethod === 'cash' ? { method: 'cash' } : paymentInfo,
        bookingId: 'VN' + Date.now()
      });
    }
  };

  const renderBookingSummary = () => (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
      <div className="flex items-center gap-3 mb-6">
        <Train className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Booking Summary</h3>
      </div>
      
      <div className="space-y-6">
        {/* Journey Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="font-semibold text-gray-800">{getStationName(booking.from)}</div>
              <div className="text-blue-600 font-medium">{formatTime(booking.train.startTime)}</div>
            </div>
            <div className="flex-1 mx-4">
              <div className="flex items-center justify-center">
                <div className="h-px bg-gray-300 flex-1"></div>
                <div className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                  {booking.train.duration}h
                </div>
                <div className="h-px bg-gray-300 flex-1"></div>
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-800">{getStationName(booking.to)}</div>
              <div className="text-blue-600 font-medium">{formatTime(booking.train.endTime)}</div>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Train:</span>
            <span className="font-semibold text-gray-800">{booking.train.id}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Coach:</span>
            <span className="text-gray-800">{booking.coach.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Departure:</span>
            <span className="text-gray-800">{new Date(booking.departureDate).toLocaleDateString('vi-VN')}</span>
          </div>
          {booking.tripType === 'round-trip' && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Return:</span>
              <span className="text-gray-800">{new Date(booking.returnDate).toLocaleDateString('vi-VN')}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{booking.coach.type === 'seat' ? 'Seats' : 'Beds'}:</span>
            <span className="text-gray-800">
              {booking.selectedItems.map(item => 
                booking.coach.type === 'seat' 
                  ? `${item.col * 4 + item.row + 1}`
                  : `${item.row * 14 + item.col + 1}`
              ).join(', ')}
            </span>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{booking.selectedItems.length} × {formatCurrency(booking.coach.price)}</span>
            <span className="text-gray-800">{formatCurrency(booking.selectedItems.length * booking.coach.price)}</span>
          </div>
          {booking.tripType === 'round-trip' && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Round-trip multiplier</span>
              <span className="text-gray-800">×2</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="font-semibold text-gray-800">Total</span>
            <span className="font-bold text-xl text-blue-600">{formatCurrency(booking.totalPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-8">
        <User className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Passenger Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Full Name *</label>
          <input
            type="text"
            value={passengerInfo.fullName}
            onChange={(e) => handleInputChange('passenger', 'fullName', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter your full name"
          />
          {errors.fullName && <span className="text-red-500 text-sm">{errors.fullName}</span>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Email *</label>
          <input
            type="email"
            value={passengerInfo.email}
            onChange={(e) => handleInputChange('passenger', 'email', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="your.email@example.com"
          />
          {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
          <input
            type="tel"
            value={passengerInfo.phone}
            onChange={(e) => handleInputChange('passenger', 'phone', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="0123456789"
          />
          {errors.phone && <span className="text-red-500 text-sm">{errors.phone}</span>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">ID Number *</label>
          <input
            type="text"
            value={passengerInfo.idNumber}
            onChange={(e) => handleInputChange('passenger', 'idNumber', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.idNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="ID/Passport number"
          />
          {errors.idNumber && <span className="text-red-500 text-sm">{errors.idNumber}</span>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
          <input
            type="date"
            value={passengerInfo.dateOfBirth}
            onChange={(e) => handleInputChange('passenger', 'dateOfBirth', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.dateOfBirth ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.dateOfBirth && <span className="text-red-500 text-sm">{errors.dateOfBirth}</span>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            value={passengerInfo.address}
            onChange={(e) => handleInputChange('passenger', 'address', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Your address (optional)"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-8">
        <CreditCard className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Payment Information</h2>
      </div>

      <div className="space-y-6 mb-8">
        <div className="flex gap-4">
          <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
            <input
              type="radio"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="text-blue-600"
            />
            <span className="font-medium">Credit/Debit Card</span>
          </label>
          <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
            <input
              type="radio"
              value="cash"
              checked={paymentMethod === 'cash'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="text-blue-600"
            />
            <span className="font-medium">Pay at Station</span>
          </label>
        </div>
      </div>

      {paymentMethod === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Card Number *</label>
            <input
              type="text"
              value={paymentInfo.cardNumber}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.cardNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="1234 5678 9012 3456"
              maxLength="19"
            />
            {errors.cardNumber && <span className="text-red-500 text-sm">{errors.cardNumber}</span>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Expiry Date *</label>
            <input
              type="text"
              value={paymentInfo.expiryDate}
              onChange={(e) => handleExpiryDateChange(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.expiryDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="MM/YY"
              maxLength="5"
            />
            {errors.expiryDate && <span className="text-red-500 text-sm">{errors.expiryDate}</span>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">CVV *</label>
            <input
              type="text"
              value={paymentInfo.cvv}
              onChange={(e) => handleInputChange('payment', 'cvv', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.cvv ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="123"
              maxLength="4"
            />
            {errors.cvv && <span className="text-red-500 text-sm">{errors.cvv}</span>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Cardholder Name *</label>
            <input
              type="text"
              value={paymentInfo.cardholderName}
              onChange={(e) => handleInputChange('payment', 'cardholderName', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.cardholderName ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Name on card"
            />
            {errors.cardholderName && <span className="text-red-500 text-sm">{errors.cardholderName}</span>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Billing Address</label>
            <input
              type="text"
              value={paymentInfo.billingAddress}
              onChange={(e) => handleInputChange('payment', 'billingAddress', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Billing address (optional)"
            />
          </div>
        </div>
      )}

      {paymentMethod === 'cash' && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-amber-800">Pay at Station</p>
            <p className="text-sm text-amber-700 mt-1">
              Please arrive at the station at least 30 minutes before departure to complete payment and collect your tickets.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-8">
        <CheckCircle className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Confirm Your Booking</h2>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Passenger Details</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Name:</span> {passengerInfo.fullName}</p>
            <p><span className="font-medium">Email:</span> {passengerInfo.email}</p>
            <p><span className="font-medium">Phone:</span> {passengerInfo.phone}</p>
            <p><span className="font-medium">ID Number:</span> {passengerInfo.idNumber}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Payment Method</h3>
          <div className="text-sm">
            {paymentMethod === 'card' ? (
              <p><span className="font-medium">Card:</span> **** **** **** {paymentInfo.cardNumber.slice(-4)}</p>
            ) : (
              <p><span className="font-medium">Method:</span> Pay at Station</p>
            )}
          </div>
        </div>

        <div className="border-t pt-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" required className="mt-1 text-blue-600" />
            <span className="text-sm text-gray-700">
              I agree to the <span className="text-blue-600 hover:underline">Terms and Conditions</span> and <span className="text-blue-600 hover:underline">Privacy Policy</span>
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Booking Confirmed!</h2>
      <p className="text-gray-600 mb-8">Your train ticket has been successfully booked.</p>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <p className="font-semibold text-gray-800 mb-2">Booking Reference: <span className="text-green-600">VN{Date.now()}</span></p>
        <p className="text-sm text-gray-600">A confirmation email has been sent to {passengerInfo.email}</p>
      </div>

      {paymentMethod === 'cash' && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-amber-700 text-sm">Remember to arrive 30 minutes early to complete payment at the station.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step, index) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep >= step 
                      ? currentStep > step 
                        ? 'bg-green-500 text-white' 
                        : 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                  </div>
                  <div className={`text-xs mt-2 font-medium ${
                    currentStep >= step ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step === 1 && 'Passenger'}
                    {step === 2 && 'Payment'}
                    {step === 3 && 'Confirm'}
                    {step === 4 && 'Complete'}
                  </div>
                </div>
                {index < 3 && (
                  <div className={`h-px w-16 transition-colors ${
                    currentStep > step ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            {/* Navigation Buttons */}
            {currentStep < 4 && (
              <div className="flex justify-between mt-8">
                <div>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      disabled={isProcessing}
                    >
                      Back
                    </button>
                  )}
                  
                  {onBack && currentStep === 1 && (
                    <button
                      type="button"
                      onClick={onBack}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back to Booking
                    </button>
                  )}
                </div>

                <div>
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={processPayment}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </div>
                      ) : (
                        `Confirm & ${paymentMethod === 'card' ? 'Pay' : 'Book'}`
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            {renderBookingSummary()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;