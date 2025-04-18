import React, { useState } from 'react'
import Map from './Map'
import '../styles/timetable.css'

const stations = [
  "Ha Noi",
  "Hai Phong",
  "Da Nang",
  "Nha Trang",
  "Ho Chi Minh City",
  // Add more stations here
]

const trains = [
  "SE1",
  "SE2",
  "SE3",
  "SE4",
  // Add more trains as needed
]

const coachTypes = [
  { id: "hs", name: "Hard Seat", price: "200000" },
  { id: "ss", name: "Soft Seat", price: "250000" },
  { id: "ssac", name: "Soft Seat (AC)", price: "300000" },
  { id: "sl6", name: "6-Berth Sleeper", price: "400000" },
  { id: "sl4", name: "4-Berth Sleeper", price: "500000" }
]

const sampleTimetable = [
  { station: "Ha Noi", distance: "0", date: "24/03", arrival: "-", departure: "06:00" },
  { station: "Nam Dinh", distance: "85", date: "24/03", arrival: "08:30", departure: "08:40" },
  { station: "Thanh Hoa", distance: "175", date: "24/03", arrival: "10:45", departure: "10:55" },
  { station: "Vinh", distance: "282", date: "24/03", arrival: "14:20", departure: "14:35" },
  { station: "Da Nang", distance: "762", date: "24/03", arrival: "23:30", departure: "23:45" },
  { station: "Nha Trang", distance: "1315", date: "25/03", arrival: "08:15", departure: "08:30" },
  { station: "Ho Chi Minh City", distance: "1726", date: "25/03", arrival: "15:30", departure: "-" }
]

const Timetable = () => {
  const [fromStation, setFromStation] = useState('')
  const [toStation, setToStation] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTrain, setSelectedTrain] = useState('')
  const [selectedCoach, setSelectedCoach] = useState('')

  const renderRouteSelection = () => (
    <div className="route-selection">
      <h2>Train Route Selection</h2>
      <form className="route-form" onSubmit={(e) => e.preventDefault()}>
        {[
          { label: 'From', value: fromStation, onChange: setFromStation, options: stations },
          { label: 'To', value: toStation, onChange: setToStation, options: stations },
          { 
            label: 'Date', 
            value: selectedDate, 
            onChange: setSelectedDate, 
            type: 'date',
            min: new Date().toISOString().split('T')[0]
          },
          { label: 'Train', value: selectedTrain, onChange: setSelectedTrain, options: trains }
        ].map(({ label, value, onChange, options, type, min }) => (
          <div className="form-group" key={label}>
            <label>{label}:</label>
            {type === 'date' ? (
              <input
                type="date"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                min={min}
                required
              />
            ) : (
              <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required
              >
                <option value="">Select {label.toLowerCase()}</option>
                {options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
          </div>
        ))}
      </form>
    </div>
  )

  const renderTimetable = () => (
    <div className="timetable">
      <h3>Route Information</h3>
      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>Station</th>
            <th>Distance (km)</th>
            <th>Date</th>
            <th>Arrival</th>
            <th>Departure</th>
          </tr>
        </thead>
        <tbody>
          {sampleTimetable.map((row, index) => (
            <tr key={index} className={row.station === fromStation || row.station === toStation ? 'highlighted-row' : ''}>
              <td>{index + 1}</td>
              <td>{row.station}</td>
              <td>{row.distance}</td>
              <td>{row.date}</td>
              <td>{row.arrival}</td>
              <td>{row.departure}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderCoachTypes = () => (
    <div className="coach-types">
      <h3>Available Coach Types</h3>
      <div className="coach-options">
        {coachTypes.map(coach => (
          <div 
            key={coach.id}
            className={`coach-option ${selectedCoach === coach.id ? 'selected' : ''}`}
            onClick={() => setSelectedCoach(coach.id)}
          >
            <h4>{coach.name}</h4>
            <p>{parseInt(coach.price).toLocaleString('vi-VN')} VND</p>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="timetable-container">
      {renderRouteSelection()}
      <div className="content-section">
        <div className="map-section">
          <Map 
            stations={stations} 
            fromStation={fromStation} 
            toStation={toStation}
          />
        </div>
        <div className="info-section">
          {renderTimetable()}
          {renderCoachTypes()}
        </div>
      </div>
    </div>
  )
}

export default Timetable