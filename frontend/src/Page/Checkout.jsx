import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, User, Mail, Phone, MapPin, Calendar, Clock, Train, Bed, Users, CheckCircle, AlertCircle } from 'lucide-react';
import ticketService from '../data/Service/ticketService.js';
import passengerService from '../data/Service/passengerService.js';
import authService from '../data/Service/authService';
import bookingService from '../data/Service/bookingService.js';
import trainService from '../data/Service/trainService.js';

const Checkout = ({ bookingData, onBack, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [booking, setBooking] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [passengerInfo, setPassengerInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    // idNumber: '',
    // dateOfBirth: '',
    // address: ''
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: ''
  });

  const handlePayment = async () => {
    try {
      let userId = null;
      const user = authService.getCurrentUser();
      if (user) {
        userId = user.userId
      }

      const passengerData = {
        fullname: passengerInfo.fullName || "undefined",
        phone_number: passengerInfo.phone || "000000000",
        email: passengerInfo.email || "undefined",
        status: "Active"
      }
      const passengerResponse = await passengerService.createPassenger(passengerData);

      const bookingData = {
        userID: userId,
        passengerID: passengerResponse.passengerID,
        bookingDate: new Date().toLocaleString('sv-SE', {
          timeZone: 'Asia/Ho_Chi_Minh',
          hour12: false
        }).replace('T', ' '),
        totalPrice: booking.totalPrice,
        status: paymentStatus
      }
      const bookingResponse = await bookingService.createBooking(bookingData);

      const trainData1 = await trainService.getTrainByName(booking.train.id);
      let expireDateTime1 = null;
      if (paymentStatus === 'pending') {
        const trainDeparture1 = new Date(`${booking.departureDate}T${booking.train.startTime}`);
        expireDateTime1 = new Date(trainDeparture1.getTime() - 30 * 60 * 1000).toISOString();
      }

      // const ticketData1 = {
      //   bookingId: bookingResponse.bookingID,
      //   passengerId: passengerResponse.passengerID,
      //   coachId: booking.selectedItems[0].coachId,
      //   trainId: trainData1.trainID,
      //   seatNumber: `${booking.selectedItems[0].row}-${booking.selectedItems[0].col}`,
      //   departureId: booking.from,
      //   arrivalId: booking.to,
      //   departureTime: booking.train.startTime,
      //   departureDate: booking.departureDate,
      //   ticketPrice: booking.selectedItems[0].price, 
      //   expireDateTime: expireDateTime1
      // };

      // const ticketResponse1 = await ticketService.createTicket(ticketData1);

      // if (booking.tripType === 'round-trip') {
      //   const trainData2 = await trainService.getTrainByName(booking.returnTrain.id);
      //   var expireDateTime2 = null;
      //   if(paymentStatus === 'pending'){
      //     const trainDeparture2 = new Date(`${booking.returnDate}T${booking.returnTrain.startTime}`);
      //     expireDateTime2 = new Date(trainDeparture2.getTime() - 30 * 60 * 1000).toISOString();
      //   }

      //   const ticketData2 = {
      //     bookingId: bookingResponse.bookingID,
      //     passengerId: passengerResponse.passengerID,
      //     coachId: booking.returnItems[0].coachId,
      //     trainId: trainData2.trainID,
      //     seatNumber: `${booking.returnItems[0].row}-${booking.returnItems[0].col}`,
      //     departureId: booking.to,
      //     arrivalId: booking.from,
      //     departureTime: booking.train.startTime,
      //     departureDate: booking.departureDate,
      //     ticketPrice: booking.returnItems[0].price, 
      //     expireDateTime: expireDateTime2
      //   };

      //   const ticketResponse2 = await ticketService.createTicket(ticketData2);        
      // }
      for (const item of booking.selectedItems) {
        const coach = booking.trainCoaches.find(c => c.coachID === item.coachId);
        const seatNumber = item.col * coach.rows + item.row + 1;

        const ticketData1 = {
          bookingId: bookingResponse.bookingID,
          passengerId: passengerResponse.passengerID,
          coachId: item.coachId,
          trainId: trainData1.trainID,
          seatNumber: seatNumber, // Store as simple number
          departureId: booking.from,
          arrivalId: booking.to,
          departureTime: booking.train.startTime,
          departureDate: booking.departureDate,
          ticketPrice: item.price,
          expireDateTime: expireDateTime1
        };

        const ticketResponse1 = await ticketService.createTicket(ticketData1);
        console.log(ticketResponse1);

      }

      if (booking.tripType === 'round-trip') {
        const trainData2 = await trainService.getTrainByName(booking.returnTrain.id);

        let expireDateTime2 = null;
        if (paymentStatus === 'pending') {
          const trainDeparture2 = new Date(`${booking.returnDate}T${booking.returnTrain.startTime}`);
          expireDateTime2 = new Date(trainDeparture2.getTime() - 30 * 60 * 1000).toISOString();
        }

        for (const item of booking.returnItems) {
          const ticketData2 = {
            bookingId: bookingResponse.bookingID,
            passengerId: passengerResponse.passengerID,
            coachId: item.coachId,
            trainId: trainData2.trainID,
            seatNumber: `${item.row}-${item.col}`,
            departureId: booking.to,
            arrivalId: booking.from,
            departureTime: booking.returnTrain.startTime,
            departureDate: booking.returnDate,
            ticketPrice: item.price,
            expireDateTime: expireDateTime2
          };

          const ticketResponse2 = await ticketService.createTicket(ticketData2);
          console.log(ticketResponse2);
        }
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      // setLoading(false);
    }
  }

  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // Modify the steps and add new payment options
  const steps = [
    { number: 1, name: 'Passenger', icon: User },
    { number: 2, name: 'Payment Options', icon: CreditCard },
    { number: 3, name: 'Complete', icon: CheckCircle }
  ];

  // Add new state for payment selection
  const [paymentOption, setPaymentOption] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle payment success when returning from TransactionBooking
    if (location.state?.paymentSuccess) {
      // Update all necessary states
      setPaymentStatus('paid');
      setCurrentStep(3);
      setPaymentOption('online');
      setPaymentInfo(location.state.paymentInfo);
      setPaymentMethod('online');

      // Update booking and passenger info if needed
      if (location.state.bookingData) {
        setBooking(location.state.bookingData);
      }
      if (location.state.passengerInfo) {
        setPassengerInfo(location.state.passengerInfo);
      }
    }
  }, [location]);

  useEffect(() => {
    const storedData = localStorage.getItem('checkoutData');
    if (storedData) {
      setBooking(JSON.parse(storedData));
      console.log('Booking data:', JSON.parse(storedData)); // ← this shows the full value in dev tools
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (location.state?.returnToStep) {
      setCurrentStep(location.state.returnToStep);
      // If we have booking data in state, update it
      if (location.state.bookingData) {
        setBooking(location.state.bookingData);
      }
      if (location.state.passengerInfo) {
        setPassengerInfo(location.state.passengerInfo);
      }
    }
  }, [location]);

  useEffect(() => {
    if (location.state?.paymentStatus) {
      setPaymentStatus('paid');
      setCurrentStep(3);
      handlePayment();
    }
  }, [location])

  useEffect(() => {
    if (location.state?.paymentInfo) {
      setPaymentInfo(location.state.paymentInfo);
      setPaymentOption('online'); // Ensure we know this is online payment
      setPaymentMethod('online');
    }
    if (location.state?.returnToStep) {
      setCurrentStep(location.state.returnToStep);
      // If we have booking data in state, update it
      if (location.state.bookingData) {
        setBooking(location.state.bookingData);
      }
      if (location.state.passengerInfo) {
        setPassengerInfo(location.state.passengerInfo);
      }
    }
  }, [location])

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
    // if (!passengerInfo.idNumber.trim()) newErrors.idNumber = 'ID number is required';
    // if (!passengerInfo.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';

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
    } else if (currentStep === 2) {
      if (!paymentOption) {
        setErrors({ payment: 'Please select a payment option' });
        return;
      }
      if (paymentOption === 'pending') {
        setPaymentStatus('pending');
        setCurrentStep(3);
      } else if (paymentOption === 'online') {
        // Replace window.location.href with navigate
        navigate('/transaction', {
          state: {
            bookingData: booking,
            passengerInfo: passengerInfo
          }
        });
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const processPayment = async () => {
    if (!termsAgreed) {
      setErrors(prev => ({
        ...prev,
        terms: 'You must agree to the Terms and Conditions to continue'
      }));
      return;
    }

    setIsProcessing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await handlePayment(); // Process the payment/booking
      setCurrentStep(4); // Move to final confirmation step
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Payment failed:', error);
      setErrors(prev => ({
        ...prev,
        payment: 'Payment processing failed. Please try again.'
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const renderBookingSummary = () => {
    if (!booking) return null;

    // Group selected items by train and coach for outbound journey
    const groupedItems = booking.selectedItems.reduce((acc, item) => {
      const key = `${item.trainId}-${item.coachId}`;
      if (!acc[key]) {
        acc[key] = {
          train: booking.train,
          coach: {
            coachID: item.coachId,
            name: item.coachName, // Use the coachName stored with each item
            type: item.coachType
          },
          items: []
        };
      }
      acc[key].items.push(item);
      return acc;
    }, {});

    // Group selected items by train and coach for return journey
    const groupedReturnItems = booking.returnItems?.reduce((acc, item) => {
      const key = `${item.trainId}-${item.coachId}`;
      if (!acc[key]) {
        acc[key] = {
          train: booking.returnTrain,
          coach: {
            coachID: item.coachId,
            name: item.coachName, // Use the coachName stored with each item
            type: item.coachType
          },
          items: []
        };
      }
      acc[key].items.push(item);
      return acc;
    }, {});

    const renderJourneySection = (groups, title = null) => (
      <div className="space-y-4">
        {title && <h4 className="font-medium text-gray-800 mb-3">{title}</h4>}
        {Object.entries(groups || {}).map(([key, group], index) => (
          <div key={key} className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Train:</span>
                <span className="font-semibold text-gray-800">{group.train.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Coach:</span>
                <span className="text-gray-800">{group.coach.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{group.coach.type === 'seat' ? 'Seats' : 'Beds'}:</span>
                <span className="text-gray-800">
                  {group.items.map(item => 
                    {
                      if (group.coach.type === 'seat') {
                        // For seats: maintain the current calculation
                        return `${item.col * 4 + item.row + 1}`;
                      } else {
                        const actualCol = item.col;
                        const bedNumber = actualCol * 2 + item.row + 1;
                        return bedNumber;
                      }
                    }
                  ).join(', ')}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {group.items.length} × {formatCurrency(group.items[0]?.price || 0)}
                </span>
                <span className="text-gray-800">
                  {formatCurrency(group.items.reduce((sum, item) => sum + item.price, 0))}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
        <div className="flex items-center gap-3 mb-6">
          <Train className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Booking Summary</h3>
        </div>

        <div className="space-y-6">
          {/* Outbound Journey */}
          {renderJourneySection(groupedItems, "Outbound Journey")}

          {/* Return Journey if applicable */}
          {booking.tripType === 'round-trip' && booking.returnItems && (
            <div className="border-t pt-4">
              {renderJourneySection(groupedReturnItems, "Return Journey")}
            </div>
          )}

          {/* Total Price */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-800">Total</span>
              <span className="font-bold text-xl text-blue-600">
                {formatCurrency(booking.totalPrice)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300'
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
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
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
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            placeholder="0123456789"
          />
          {errors.phone && <span className="text-red-500 text-sm">{errors.phone}</span>}
        </div>

        {/* <div className="space-y-2">
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
        </div> */}

        {/* <div className="space-y-2">
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
        </div> */}

        {/* <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            value={passengerInfo.address}
            onChange={(e) => handleInputChange('passenger', 'address', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Your address (optional)"
          />
        </div> */}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-8">
        <CreditCard className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Choose Payment Option</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Option */}
        <div
          onClick={() => {
            setPaymentOption('pending');
            setPaymentMethod('pending');
          }}
          className={`cursor-pointer transition-all duration-300 transform hover:scale-105
            ${paymentOption === 'pending' ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'}
            rounded-xl overflow-hidden`}
        >
          <div className="bg-gradient-to-br from-amber-100 to-amber-50 p-6 text-center">
            <Clock className="w-12 h-12 text-amber-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Pending Payment</h3>
            <p className="text-gray-600 text-sm">
              Reserve now, pay later at the station
            </p>
            <ul className="mt-4 text-left text-sm space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No immediate payment required</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Pay at station before departure</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Arrive 30 minutes early</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Online Payment Option */}
        <div
          onClick={() => {
            setPaymentOption('online');
            setPaymentMethod('online');
          }}
          className={`cursor-pointer transition-all duration-300 transform hover:scale-105
            ${paymentOption === 'online' ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'}
            rounded-xl overflow-hidden`}
        >
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-6 text-center">
            <CreditCard className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Pay Online</h3>
            <p className="text-gray-600 text-sm">
              Secure payment via credit/debit card
            </p>
            <ul className="mt-4 text-left text-sm space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Instant confirmation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Secure payment gateway</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>E-ticket available immediately</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {paymentOption && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800 font-medium">
            {paymentOption === 'pending'
              ? 'Your booking will be held for 24 hours. Please complete payment at the station.'
              : 'You will be redirected to our secure payment gateway.'}
          </p>
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
            {/* <p><span className="font-medium">ID Number:</span> {passengerInfo.idNumber}</p> */}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Payment Method</h3>
          <div className="text-sm">
            {paymentOption === 'online' ? (
              <div className="space-y-1">
                <p><span className="font-medium">Method:</span> Credit/Debit Card</p>
                <p><span className="font-medium">Card:</span> **** **** **** {paymentInfo.cardNumber.replace(/\s/g, '').slice(-4)}</p>
                <p><span className="font-medium">Cardholder:</span> {paymentInfo.cardholderName}</p>
              </div>
            ) : paymentOption === 'pending' ? (
              <p><span className="font-medium">Method:</span> Pay at Station</p>
            ) : (
              <p><span className="font-medium">Method:</span> Not selected</p>
            )}
          </div>
        </div>

        <div className="border-t pt-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              required
              className="mt-1 text-blue-600"
            />
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
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : !booking ? (
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Booking Data Found</h2>
          <p className="text-gray-600 mb-4">Please select your tickets before proceeding to checkout.</p>
          <Link
            to="/buy-ticket"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Booking
          </Link>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4">
          {/* Progress Bar */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${currentStep >= step.number
                      ? currentStep > step.number
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                      }`}>
                      {currentStep > step.number ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <step.icon className="w-6 h-6" />
                      )}
                    </div>
                    <div className={`text-sm mt-2 font-medium ${currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                      {step.name}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-px w-20 transition-colors ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
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
                        disabled={isProcessing || !termsAgreed}
                        className={`px-8 py-3 text-white rounded-lg transition-colors font-medium
                          ${termsAgreed
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-gray-400 cursor-not-allowed'}`}
                      >
                        {isProcessing ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                          </div>
                        ) : (
                          `Confirm & ${paymentOption === 'online' ? 'Pay' : 'Book'}`
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
      )}
    </div>
  );
};

export default Checkout;