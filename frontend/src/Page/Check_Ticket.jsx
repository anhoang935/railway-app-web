import React, { useState, useEffect } from 'react';
import coach1 from '../images/coach1.png';
import '../styles/check_ticket.css';

const Check_Ticket = () => {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    departureDate: '',
    type: '',
    ticketId: ''
  })

  const ticketDatas = [
    { id: 1, bookId: 1, passengerId: 1, trainId: 1, coachId: 1, seatNumber: 1, departureStationId: 1, arrivalStationId: 2, departureTime: '08:00', departureDate: '2023-10-01', arrivalDate: '2023-10-01', status: 'pending' },
    { id: 2, bookId: 2, passengerId: 2, trainId: 2, coachId: 2, seatNumber: 5, departureStationId: 3, arrivalStationId: 4, departureTime: '10:30', departureDate: '2023-10-02', arrivalDate: '2023-10-02', status: 'confirmed' },
    { id: 3, bookId: 3, passengerId: 3, trainId: 3, coachId: 3, seatNumber: 10, departureStationId: 5, arrivalStationId: 6, departureTime: '14:15', departureDate: '2023-10-03', arrivalDate: '2023-10-03', status: 'cancelled' },
    { id: 4, bookId: 4, passengerId: 4, trainId: 4, coachId: 4, seatNumber: 20, departureStationId: 7, arrivalStationId: 8, departureTime: '16:45', departureDate: '2023-10-04', arrivalDate: '2023-10-04', status: 'pending' },
    { id: 5, bookId: 5, passengerId: 5, trainId: 5, coachId: 5, seatNumber: 25, departureStationId: 9, arrivalStationId: 10, departureTime: '18:00', departureDate: '2023-10-05', arrivalDate: '2023-10-05', status: 'confirmed' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  }

  const renderTickets = () => {
    
  }

  

  return (
    <div className='booking-container bg-[#f0f7ff]'>      
      <div className='booking-content bg-white shadow-lg p-6 text-blue-600'>
        <h1 className='page-title h-1 mb-4'>Check Ticket</h1>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4'>
          <div>
            <span>Ticket ID</span>
            <input 
              type="text"
              name="ticketId"
              className="field-input"
              value={formData.ticketId}
              onChange={(e) => setFormData({ ...formData, ticketId: e.target.value })}
            />
          </div>
          <div>
            <span>Train type:</span>
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
            <span>Departure Date</span>
            <input 
              type="date" 
              name="departureDate"
              className="field-input"
              value={formData.departureDate}
              onChange={handleInputChange}
            />
          </div>
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
          <button className="search-button ">Find Ticket</button>
          <button className="search-button ">Find My Tickets</button>
        </div>
      </div>
      {renderTickets()}
      <div className='ticketDetails bg-white shadow-lg p-4 text-blue-600 rounded-xl border-4 border-blue-400 flex flex-col md:flex-row md:gap-6 md:p-6 md:w-[750px] mx-auto mt-4'>
        <div className='leftTicket flex gap-3 md:flex-col justify-items-center place-self-center md:place-self-start'>
          <h1 className='font-bold text-lg text-blue-600'>Train Ticket</h1>
          <img src={coach1} alt="" className='hidden md:block' />
          <h1 className='font-bold text-lg text-yellow-400'>Luxury Coach</h1>
        </div>
        <div className='rightTicket flex flex-col flex-1 '>
          <h1 className='font-bold text-lg text-blue-600 place-self-center'>Ticket Details</h1>
          <div className='ticketContents flex flex-row px-4 md:p-3 md:gap-6'>
            <div className='ticketContents1 md:w-[50%]'>
              <div className='ticketContentElement'> 
                <p>Ticket ID: </p>
                <p className='ticketContentElementDetail'> 123456</p>
              </div>
              <div className='ticketContentElement'> 
                <p>Passenger Name: </p>
                <p className='ticketContentElementDetail' > John Doesasdfasd</p>
              </div>
              <div className='ticketContentElement'> 
                <p>Train Number: </p>
                <p className='ticketContentElementDetail'> 12345</p>
              </div>
            </div>
            <div className='ticketContents2 ml-auto md:w-[50%]'>
              <div className='ticketContentElement'>
                <p>Departure Station:</p>
                <p className='ticketContentElementDetail'>City A</p>
              </div>
              <div className='ticketContentElement'>
                <p>Arrival Station:</p>
                <p className='ticketContentElementDetail'>City Basdasdsadsadasdsads</p>
              </div>
              <div className='ticketContentElement'>
                <p>Departure Date:</p>
                <p className='ticketContentElementDetail'>2023-10-01</p>
              </div>
              <div className='ticketContentElement'>
                <p>Departure Time:</p>
                <p className='ticketContentElementDetail'>08:00 AM</p>
              </div>
              <p>Status: <span className='text-green-600'>Confirmed</span></p>
            </div>
          </div>
        </div>
        

      </div>
    </div>
  )
}

export default Check_Ticket