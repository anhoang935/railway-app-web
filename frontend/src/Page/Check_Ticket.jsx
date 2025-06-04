import React, { useState, useEffect } from 'react';
import coachYellow from '../images/coach1.png';
import coachSilver from '../images/coach2.png';
import coachBlack from '../images/coach3.png';
import coachBlue from '../images/coach4.png';
import coachGreen from '../images/coach5.png';
import LoadingSpinner from './Admin/Components/LoadingSpinner.jsx';
import { motion } from 'framer-motion';
import { Alert } from 'reactstrap';

import '../styles/check_ticket.css';
import axios from 'axios';
import ticketService from '../data/Service/ticketService.js';

const Check_Ticket = () => {
  const [formData, setFormData] = useState({
    passName: '',
    passEmail: '',
    phoneNum: ''
    // from: '',
    // to: '',
    // departureDate: '',
    // type: '',
    // ticketId: ''
  });

  // const ticketDatas = [
  //   { id: 1, bookId: 1, passengerId: 1, trainId: 1, coachId: 1, seatNumber: 1, departureStationId: 1, arrivalStationId: 2, departureTime: '08:00', departureDate: '2023-10-01', arrivalDate: '2023-10-01', status: 'pending' },
  //   { id: 2, bookId: 2, passengerId: 2, trainId: 2, coachId: 2, seatNumber: 5, departureStationId: 3, arrivalStationId: 4, departureTime: '10:30', departureDate: '2023-10-02', arrivalDate: '2023-10-02', status: 'confirmed' },
  //   { id: 3, bookId: 3, passengerId: 3, trainId: 3, coachId: 3, seatNumber: 10, departureStationId: 5, arrivalStationId: 6, departureTime: '14:15', departureDate: '2023-10-03', arrivalDate: '2023-10-03', status: 'cancelled' },
  //   { id: 4, bookId: 4, passengerId: 4, trainId: 4, coachId: 4, seatNumber: 20, departureStationId: 7, arrivalStationId: 8, departureTime: '16:45', departureDate: '2023-10-04', arrivalDate: '2023-10-04', status: 'pending' },
  //   { id: 5, bookId: 5, passengerId: 5, trainId: 5, coachId: 5, seatNumber: 25, departureStationId: 9, arrivalStationId: 10, departureTime: '18:00', departureDate: '2023-10-05', arrivalDate: '2023-10-05', status: 'confirmed' }
  // ];

  const [filteredTickets, setFilteredtickets] = useState([]);

  const getCoachImage = (coachType) => {
    if (coachType === 'Room 4 beds') return coachSilver;
    if (coachType === 'Room 6 beds') return coachBlue;
    if (coachType === 'Soft seat') return coachGreen;
    if (coachType === 'Hard seat') return coachYellow;
    return coachBlack;
  }

  const getCoachColor = (coachType) => {
    if (coachType === 'Room 4 beds') return 'text-gray-400';
    if (coachType === 'Room 6 beds') return 'text-blue-400';
    if (coachType === 'Soft seat') return 'text-green-400';
    if (coachType === 'Hard seat') return 'text-yellow-400';
    return 'text-black-400';
  }

  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState([]);

  const handleFindTickets = async () => {
    setError(validateForm());
    setSearched(true);

    try {
      setLoading(true);
      const filters = {
        userId: undefined,
        passengerName: formData.passName || undefined,
        passengerEmail: formData.passEmail || undefined,
        phoneNumber: formData.phoneNum || undefined,
        // arrivalName: formData.to || undefined,
        // departureDate: formData.departureDate || undefined,
        // trainType: formData.type || undefined
      };

      const response = await ticketService.getFilteredTickets(filters);
      setFilteredtickets(response);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleFindUserTickets = async () => {
    try {
      const filters = {
        userId: undefined
      };

      const response = await ticketService.getFilteredTickets(filters);
      setFilteredtickets(response);
    } catch (error) {
      console.error('Error fetchin tickets:', error);
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  }


  const validateForm = () => {
    const validationErrors = [];

    if (!formData.passName) {
      validationErrors.push("Name must not be empty!");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.passEmail) {
      validationErrors.push("Email must not be empty!");
    } else {
      if (!emailRegex.test(formData.passEmail)) {
        validationErrors.push("Please enter a valid email address");
      }
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.phoneNum) {
      validationErrors.push("Phone number must not be empty!");
    } else {
      if (!phoneRegex.test(formData.phoneNum)) {
        validationErrors.push("Phone number must be 10 digits long");
      }
    }

    return validationErrors;
  }

  const renderTickets = () => {

    if (error.length > 0) {
      return (
        <motion.div className='mt-10' initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          {error.map((err) => (
            <Alert color="danger" className="mb-4 text-center">{err}</Alert>
          ))}
        </motion.div>
      );
    }

    if (searched && filteredTickets.length === 0) {
      return (
        <p className="text-center text-gray-500 mt-20">Couldn't find any tickets.</p>
      );
    }

    return filteredTickets.map((ticket) => (
      <div className='ticketDetails bg-white shadow-lg p-4 text-blue-600 rounded-xl border-4 border-blue-400 flex flex-col md:flex-row md:gap-6 md:p-6 md:w-[750px] mx-auto mt-4'>
        <div className='leftTicket flex gap-3 md:flex-col justify-items-center place-self-center md:place-content-center md:place-items-center'>
          <h1 className='font-bold text-lg text-blue-600'>Train Ticket</h1>
          <img src={getCoachImage(ticket.coachType.split(',')[0])} alt="" className='hidden md:block' />
          <h1 className={`font-bold text-lg ${getCoachColor(ticket.coachType.split(',')[0])}`}>{ticket.coachType.split(',')[0]}</h1>
        </div>
        <div className='rightTicket flex flex-col flex-1 '>
          <h1 className='font-bold text-lg text-blue-600 place-self-center'>Ticket Details</h1>
          <div className='ticketContents flex flex-row px-4 md:p-3 md:gap-6'>
            <div className='ticketContents1 md:w-[50%]'>
              <div className='ticketContentElement'>
                <p>Ticket ID: </p>
                <p className='ticketContentElementDetail'>{ticket.ticketId}</p>
              </div>
              <div className='ticketContentElement'>
                <p>Passenger Name: </p>
                {/* <p className='ticketContentElementDetail' >{ticket.passengerName}</p> */}
              </div>
              <div>
                <u>{ticket.passengerName}</u>
              </div>
              <div className='ticketContentElement'>
                <p>Train Name: </p>
                <p className='ticketContentElementDetail'>{ticket.trainName}</p>
              </div>
              <div className='ticketContentElement'>
                <p>Seat Number: </p>
                <p className='ticketContentElementDetail'>{ticket.seatNumber}</p>
              </div>
            </div>
            <div className='ticketContents2 ml-auto md:w-[50%]'>
              <div className='ticketContentElement'>
                <p>Departure Station:</p>
                <p className='ticketContentElementDetail'>{ticket.departureStation}</p>
              </div>
              <div className='ticketContentElement'>
                <p>Arrival Station:</p>
                <p className='ticketContentElementDetail'>{ticket.arrivalStation}</p>
              </div>
              <div className='ticketContentElement'>
                <p>Departure Date:</p>
                <p className='ticketContentElementDetail'>{new Date(ticket.departureDate).toLocaleDateString()}</p>
              </div>
              <div className='ticketContentElement'>
                <p>Departure Time:</p>
                <p className='ticketContentElementDetail'>{ticket.departureTime}</p>
              </div>
              <p>Status: <span className='text-green-600'>Confirmed</span></p>
            </div>
          </div>
        </div>
      </div>
    ));
  }



  return (
    <div className='booking-container bg-[#f0f7ff]'>
      <div className='booking-content bg-white shadow-lg p-6 text-blue-600'>
        <h1 className='page-title h-1 mb-4'>Check Ticket</h1>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4'>
          <div>
            <span>Passenger Name</span>
            <input
              type="text"
              name="passengerName"
              className="field-input"
              value={formData.passName}
              onChange={(e) => setFormData({ ...formData, passName: e.target.value })}
            />
          </div>
          <div>
            <span>Passenger Email</span>
            <input
              type="text"
              name="passengerEmail"
              className="field-input"
              value={formData.passEmail}
              onChange={(e) => setFormData({ ...formData, passEmail: e.target.value })}
            />
          </div>
          <div>
            <span>Phone Number</span>
            <input
              type="text"
              name="passengerEmail"
              className="field-input"
              value={formData.phoneNum}
              onChange={(e) => setFormData({ ...formData, phoneNum: e.target.value })}
            />
          </div>
          {/* <div>
            <span>Departure Station</span>
            <select 
              name="from" 
              className='field-select'
              value={formData.from}
              onChange={handleInputChange}
            >
              <option value="">Select departure station</option>
            </select>
          </div>
          <div>
            <span>Arrival Station</span>
            <select 
              name="to"
              className='field-select'
              value={formData.to}
              onChange={handleInputChange}
            >
              <option value="">Select arrival station</option>
            </select>
          </div>
          <div>
            <span>Train Type:</span>
            <select 
              name="type"
              className='field-select'
              value={formData.type}
              onChange={handleInputChange}
            >
              <option value="">Select Train</option>
            </select>
          </div>
          <div>
            <span>Departure Date</span>
            <input 
              type="date" 
              name="departureDate"
              className="field-input"
              value={formData.departureDate}
              onChange={handleInputChange}
            />
          </div> */}
          {/* <div className='relative flex flex-row flex-wrap gap-4'>
            <button 
              className='search-button h-10 md:absolute lg:h-20 bottom-0'
            >
              Find Ticket
            </button>
            <button
              className='search-button h-10 md:absolute lg:h-20 bottom-0 right-0'
            >
              Find My Tickets
            </button>
          </div> */}


        </div>
        <div className="flex flex-col md:flex-row flex-wrap gap-4 pt-5">
          <button className="search-button" onClick={handleFindTickets}>Find Ticket</button>
          <button className="search-button" onClick={handleFindUserTickets}>Find My Tickets</button>
        </div>
      </div>
      {loading ? (<LoadingSpinner />) : (renderTickets())}
    </div>
  )
}

export default Check_Ticket