import React, { useState, useEffect } from 'react';
import Seat from '../ui/models/Seat';
import Bed from '../ui/models/Bed';
import '../styles/buy_ticket.css';
import { Trash } from 'lucide-react';

document.documentElement.style.setProperty('--primary-color', '#2563eb');

const Buy_Ticket = () => {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    departureDate: '',
    returnDate: '',
    departureTime: '',
    trainType: '',
    tripType: 'one-way'
  });

  const [availableTrains, setAvailableTrains] = useState([]);
  
  const [selectedTrain, setSelectedTrain] = useState(null);
  
  const [selectedCoach, setSelectedCoach] = useState(null);

  const [showSelectionPanel, setShowSelectionPanel] = useState(false);
  
  const [hoveredItem, setHoveredItem] = useState(null);
  
  const [selectedItems, setSelectedItems] = useState([]);

  const [showSearchResults, setShowSearchResults] = useState(false);

  const majorStations = [
    { id: 'hanoi', name: 'Hà Nội',},
    { id: 'vinh', name: 'Vinh',},
    { id: 'hue', name: 'Huế',},
    { id: 'danang', name: 'Đà Nẵng',},
    { id: 'nhatrang', name: 'Nha Trang',},
    { id: 'saigon', name: 'Sài Gòn',},
    
  ]

  const trainTypes = [
    { id: 'SE1', direction: 'Bắc-Nam', startTime: '12:00', endTime: '04:00', duration: 16 },
    { id: 'SE2', direction: 'Nam-Bắc', startTime: '13:00', endTime: '05:00', duration: 16 },
    { id: 'SE3', direction: 'Bắc-Nam', startTime: '18:00', endTime: '10:00', duration: 16 },
    { id: 'SE4', direction: 'Nam-Bắc', startTime: '19:00', endTime: '11:00', duration: 16 },
    { id: 'SE5', direction: 'Bắc-Nam', startTime: '10:30', endTime: '02:30', duration: 16 },
    { id: 'SE6', direction: 'Nam-Bắc', startTime: '11:30', endTime: '03:30', duration: 16 },
    { id: 'SE7', direction: 'Bắc-Nam', startTime: '17:15', endTime: '09:15', duration: 16 },
    { id: 'SE8', direction: 'Nam-Bắc', startTime: '18:15', endTime: '10:15', duration: 16 }
  ]

  const coachTypes = [
    { id: 'room-4-bed', name: 'Room 4 beds, Air-Con', price: 1200000, type: 'bed', rows: 2, cols: 14 },
    { id: 'room-6-bed', name: 'Room 6 beds, Air-Con', price: 900000, type: 'bed', rows: 3, cols: 14 },
    { id: 'soft-seat', name: 'Soft seat, Air-Con', price: 700000, type: 'seat', rows: 4, cols: 14 },
    { id: 'hard-seat', name: 'Hard seat, Air-Con', price: 500000, type: 'seat', rows: 4, cols: 14 }
  ]

  const calculateDistance = (from, to) => {
    const stationIndices = {};
    majorStations.forEach((station, index) => {
      stationIndices[station.id] = index;
    })
    if(stationIndices[from] === stationIndices[to]) return 0;
    return Math.abs(stationIndices[from] - stationIndices[to]) * 200; 
  }

  // Function to calculate return date based on distance
  const calculateReturnDate = (departureDate, distance) => {
    const date = new Date(departureDate);
    const days = Math.ceil((distance / 500)*5) // 1 day per 500km (testing)
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
  }

  const searchTrains = () => {
    const { from, to, departureTime } = formData
    
    if (!from || !to || from === to) return;
    
    const fromStation = majorStations.find(s => s.id === from)
    const toStation = majorStations.find(s => s.id === to)
    
    let direction;
    if (fromStation && toStation) {
      const fromIndex = majorStations.findIndex(s => s.id === from)
      const toIndex = majorStations.findIndex(s => s.id === to)
      direction = fromIndex < toIndex ? 'Bắc-Nam' : 'Nam-Bắc'
    }
    
    let filtered = trainTypes.filter(train => train.direction === direction);
    
    if (departureTime) {
      const selectedTime = new Date(`2000-01-01T${departureTime}`);
      filtered = filtered.filter(train => {
        const trainTime = new Date(`2000-01-01T${train.startTime}`);
        // Allow 3 hours before and after the selected time
        const diffHours = Math.abs(trainTime - selectedTime) / 36e5;
        return diffHours <= 3;
      })
    }

    const distance = calculateDistance(from, to);
    const trains = filtered.map(train => ({
      ...train,
      distance,
      returnDate: calculateReturnDate(formData.departureDate, distance)
    }))
    
    setAvailableTrains(trains)
    setSelectedTrain(null)
    setSelectedCoach(null)
    setSelectedItems([])
    setShowSearchResults(true)
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = { ...prev, [name]: value }

      if ((name === 'from' || name === 'to') && newData.from && newData.to && newData.from !== newData.to) {
        const distance = calculateDistance(newData.from, newData.to)
        if (newData.departureDate) {
          newData.returnDate = calculateReturnDate(newData.departureDate, distance)
        }
      }
      
      // If changing departure date, recalculate return date
      if (name === 'departureDate' && newData.from && newData.to) {
        const distance = calculateDistance(newData.from, newData.to)
        newData.returnDate = calculateReturnDate(value, distance)
      }
      
      return newData
    })
  }

  const handleSelectTrain = (train) => {
    setSelectedTrain(train)
    setSelectedCoach(null)
    setSelectedItems([])
  }

  const handleSelectCoach = (coach) => {
    setSelectedCoach(coach)
    setSelectedItems([])
  };

  // Handle seat/bed selection
  const handleSelectItem = (row, col) => {
    const key = `${row}-${col}`
    const isBooked = Math.random() > 0.7
    
    if (isBooked) return;
    
    setSelectedItems(prev => {
      const exists = prev.find(item => item.key === key);
      if (exists) {
        return prev.filter(item => item.key !== key);
      } else {
        setShowSelectionPanel(true);
        return [...prev, { key, row, col, price: selectedCoach.price }];
      }
    })
  }

  const removeSelectedItem = (key) => {
    setSelectedItems(prev => prev.filter(item => item.key !== key))

    if (selectedItems.length <= 1){
      setShowSelectionPanel(false);
    }
  }

  const renderSeatsOrBeds = () => {
    if(!selectedCoach) return null;

    const {row, col, type} = selectedCoach;

    if(type === 'seat'){
      return renderRegularCoach(selectedCoach);
    }
      return renderSleeperCoach(selectedCoach);
  }

  const renderRegularCoach = (coach) => {
    const columns = [];
    const {rows, cols} = coach;

    for(let c = 0; c < cols; c++){
      const columnSeats = [];
      const isAfterSeparator = c  >= cols/2;

      for(let r = 0; r < rows; r++){
        const seatIndex = c * rows + r;
        const seatNumber = seatIndex + 1;
        const key = `${r}-${c}`;
        const booked =  isItemBooked(r, c);
        const selected = selectedItems.some(item => item.key === key);
        const hovered = hoveredItem === key;

        if(r === 2 && rows >= 4){
          columnSeats.push(
            <div key={`aisle-${c}-${r}`} className='h-[20px] w-full'></div>
          )
        }
        columnSeats.push(
          <div key={key} onClick={() => !booked && handleSelectItem(r, c)}>
            <Seat
            seatNumber={seatNumber}
            price={formatCurrency(coach.price)}
            isBooked={booked}
            isSelected={selected}
            isHovered={hovered}
            isReversed={isAfterSeparator}
            onMouseEnter={() => setHoveredItem(key)}
            onMouseLeave={() => setHoveredItem(null)}
            />
          </div>
        )
      }
      if (c === Math.floor(cols / 2) - 1) {
        columns.push(
          <div key={`column-${c}`} className="seat-column">
            {columnSeats}
          </div>
        );
        
        columns.push(
          <div key={`separator-${c}`} className="column-separator">
            <div className="flex w-3 h-12 bg-gray-300 rounded-sm sm:w-4 sm:h-20"></div> 
            <div className="flex-1"></div>
            <div className="flex w-3 h-12 bg-gray-300 rounded-sm sm:w-4 sm:h-20"></div> 
          </div>
        );
      } 
      else {
        columns.push(
          <div key={`column-${c}`} className="seat-column">
            {columnSeats}
          </div>
        );
      }
    }
    return (
      <div className="coach-layout">
        {columns}
      </div>
    );
  }

  const renderSleeperCoach = (coach) => {
    const { rows, cols } = coach;
    const cabins = Math.ceil(cols / 2);

    const tiers = [];
    for (let row = 0; row < rows; row++) {
      const tierNumber = rows - row;
      tiers.push(
        <div key={`tier-label-${tierNumber}`} className="tier-label">
          T{tierNumber}
        </div>
      );
    }

    const cabinsLayout = [];

    for(let cabinIdx = 0; cabinIdx < cabins; cabinIdx++){
      const cabinBeds = [];

      for(let col = 0; col < 2; col++){
        const columnBeds = [];

        for(let row = 0; row < rows; row++){
          const actualCol = cabinIdx * 2 + col;
          const key = `${row}-${actualCol}`;
          const bedNumber = row * cols + actualCol + 1;
          const booked = isItemBooked(row, actualCol);
          const selected = selectedItems.some(item => item.key === key);
          const hovered = hoveredItem === key;
          const tierNumber = rows - row;

          columnBeds.push(
            <div key={key} className="bed-container">
              <div onClick={() => !booked && handleSelectItem(row, actualCol)}>
                <Bed
                  bedNumber={bedNumber}
                  tierNumber={tierNumber}
                  price={formatCurrency(coach.price)}
                  isBooked={booked}
                  isSelected={selected}
                  isHovered={hovered}
                  onMouseEnter={() => setHoveredItem(key)}
                  onMouseLeave={() => setHoveredItem(null)}
                />
              </div>
            </div>
          )
        }

        cabinBeds.push(
          <div key={`cabin-${cabinIdx}-column-${col}`} className="cabin-column">
            {columnBeds}
          </div>
        );
      }

      cabinsLayout.push(
        <div key={`cabin-${cabinIdx}`} className="mb-4">
          <div className="cabin-title">
            Cabin {cabinIdx + 1}
          </div>
          <div className="cabin-container border-blue-800">
            {cabinBeds}
          </div>
        </div>
      )
    }
    return (
      <div className="flex flex-col items-center">
        <div className="flex flex-row">
          <div className="tier-labels">
            {tiers}
          </div>
          
          <div className="cabins-grid">
            {cabinsLayout}
          </div>
        </div>
      </div>
    );
  }
  const calculateTotalPrice = () => {
    const itemsPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);
    return formData.tripType === 'round-trip' ? itemsPrice * 2 : itemsPrice;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatTime = (timeStr) => {
    return timeStr.replace(':', 'h');
  };

  // Generate today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

  // Generate random booked status for seats/beds (testing)
  const isItemBooked = (row, col) => {
    // Simulate random booked status based on row and col (testing)
    return ((row * 31 + col * 17) % 10) < 3;
  };

  // useEffect(() => {
  //   if (formData.from && formData.to && formData.departureDate) {
  //     searchTrains();
  //   }
  // }, [formData.from, formData.to, formData.departureDate, formData.departureTime]);

  const renderSelectionPanel = () => {
    if (!showSelectionPanel || selectedItems.length === 0) return null;
    
    return (
      <div className="selection-panel bg-white shadow-lg rounded-lg border-gray-200">
        <div className="panel-header">
          <h3 className="font-semibold">Selected Seats/Beds</h3>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowSelectionPanel(false)}
          >
            ✕
          </button>
        </div>
        
        <div className="divide-y">
          {selectedItems.map(item => {
            let itemNumber;
            if (selectedCoach.type === 'seat') {
              itemNumber = item.col * selectedCoach.rows + item.row + 1;
            }
            else {
              itemNumber = item.row * selectedCoach.cols + item.col + 1;
            }
            
            
            return (
              <div key={item.key} className="selected-item">
                <div>
                  <div className="font-medium">
                    {selectedCoach.type === 'seat' ? 'Seat' : 'Bed'} #{itemNumber}
                  </div>
                  <div className="text-sm text-gray-600">{formatCurrency(item.price)}</div>
                </div>
                <button
                  onClick={() => removeSelectedItem(item.key)}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Remove item"
                >
                  <Trash/>
                </button>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-2 border-t">
          <div className="total-section">
            <span>Total:</span>
            <span className="font-semibold">{formatCurrency(calculateTotalPrice())}</span>
          </div>
          <button
            className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="booking-container bg-[#f0f7ff]">
      <div className="bg-white shadow-lg booking-content">
        {/* Search Form */}
        <div className="p-6 bg-gradient-to-r bg-white text-blue-600">
          <h1 className="page-title mb-4">Book North-South Railway Tickets</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Trip Type */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="tripType"
                    value="one-way"
                    checked={formData.tripType === 'one-way'}
                    onChange={handleInputChange}
                    className="radio-input"
                  />
                  <span className="ml-2">One-trip</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="tripType"
                    value="round-trip"
                    checked={formData.tripType === 'round-trip'}
                    onChange={handleInputChange}
                    className="radio-input"
                  />
                  <span className="ml-2">Round-trip</span>
                </label>
              </div>
            </div>
            
            {/* From Station */}
            <div>
              <label className="form-field">Departure Station</label>
              <select
                name="from"
                value={formData.from}
                onChange={handleInputChange}
                className="field-select"
              >
                <option value="">Select departure station</option>
                {majorStations.map(station => (
                  <option key={station.id} value={station.id}>{station.name}</option>
                ))}
              </select>
            </div>
            
            {/* To Station */}
            <div>
              <label className="form-field">Arrival Station</label>
              <select
                name="to"
                value={formData.to}
                onChange={handleInputChange}
                className="field-select"
              >
                <option value="">Select arrival station</option>
                {majorStations.map(station => (
                  <option key={station.id} value={station.id}>{station.name}</option>
                ))}
              </select>
            </div>
            
            {/* Departure Date */}
            <div>
              <label className="form-field">Departure Date</label>
              <input
                type="date"
                name="departureDate"
                value={formData.departureDate}
                onChange={handleInputChange}
                min={today}
                className="field-input"
              />
            </div>
            
            {/* Return Date (for round trip) */}
            {formData.tripType === 'round-trip' && (
              <div>
                <label className="form-field">Return Date</label>
                <input
                  type="date"
                  name="returnDate"
                  value={formData.returnDate}
                  disabled
                  className="field-input disabled"
                />
                <p className="text-xs mt-1">The return date is automatically calculated based on the distance</p>
              </div>
            )}
            
            {/* Departure Time */}
            <div>
              <label className="form-field">Time (Optional)</label>
              <input
                type="time"
                name="departureTime"
                value={formData.departureTime}
                onChange={handleInputChange}
                className="field-input"
              />
            </div>
            
            {/* Search Button */}
            <div className="flex items-end">
              <button
                onClick={searchTrains}
                className="search-button"
                disabled={!formData.from || !formData.to || !formData.departureDate}
              >
                Find Train
              </button>
            </div>
          </div>
        </div>
        
        {/* Available Trains */}
        {showSearchResults && availableTrains.length > 0 && (
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Available Trains</h2>
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {availableTrains.map(train => (
                <div
                  key={train.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedTrain?.id === train.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => handleSelectTrain(train)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg">{train.id}</h3>
                    <span className="text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
                      {train.direction}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm mb-2">
                    <div>
                      <div className="font-semibold text-lg">{formatTime(train.startTime)}</div>
                      <div className="text-gray-500">{formData.from && majorStations.find(s => s.id === formData.from)?.name}</div>
                    </div>
                    <div className="flex flex-col items-center justify-center px-4">
                      <div className="text-gray-500 text-xs">{train.duration}h</div>
                      <div className="w-20 h-px bg-gray-300 my-1"></div>
                      <div className="text-gray-500 text-xs">{train.distance}km</div>
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{formatTime(train.endTime)}</div>
                      <div className="text-gray-500">{formData.to && majorStations.find(s => s.id === formData.to)?.name}</div>
                    </div>
                  </div>
                  
                  {formData.tripType === 'round-trip' && (
                    <div className="mt-2 pt-2 border-t border-dashed">
                      <div className="text-sm text-gray-600">
                        Return Date: {new Date(train.returnDate).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Select Coach */}
        {selectedTrain && (
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Select Coach</h2>
            
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
              {coachTypes.map(coach => (
                <div
                  key={coach.id}
                  className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all ${
                    selectedCoach?.id === coach.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => handleSelectCoach(coach)}
                >
                  <h3 className="font-medium">{coach.name}</h3>
                  <div className="mt-2 font-semibold text-blue-600">{formatCurrency(coach.price)}</div>
                  <div className="mt-1 text-sm text-gray-500">
                    {coach.type === 'seat' ? 'Seater' : 'Sleeper'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Seat/Bed Selection */}
        {selectedCoach && (
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Choose Your Seat</h2>
            
            <div className="bg-gray-100 rounded-lg p-4">
              {renderSeatsOrBeds()}
            </div>
            
            {/* Selected Items Summary */}
            {selectedItems.length > 0 && (
              <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Booking Information</h3>
                
                <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-600">Train: {selectedTrain.id}</p>
                    <p className="text-sm text-gray-600">Coach: {selectedCoach.name}</p>
                    <p className="text-sm text-gray-600">
                      Journey: {majorStations.find(s => s.id === formData.from)?.name} → {majorStations.find(s => s.id === formData.to)?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Departure Date: {new Date(formData.departureDate).toLocaleDateString('vi-VN')}
                    </p>
                    {formData.tripType === 'round-trip' && (
                      <p className="text-sm text-gray-600">
                        Arrival Date: {new Date(selectedTrain.returnDate).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">
                    Quantity: {selectedItems.length} {selectedCoach.type === 'seat' ? 'seats' : 'beds'}
                    </p>
                    <p className="text-sm text-gray-600">
                    Number: {selectedItems.map(
                              item => 
                                selectedCoach.type === 'seat' 
                                  ? `${item.col * selectedCoach.rows + item.row + 1}` 
                                  : `${item.row * selectedCoach.cols + item.col + 1}`
                              ).join(', ')}
                    </p>
                    <p className="font-semibold mt-2">
                      Total: {formatCurrency(calculateTotalPrice())}
                      {formData.tripType === 'round-trip' && ' (Round-trip)'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors">
                    Continue
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {renderSelectionPanel()}
    </div>
  );
};

export default Buy_Ticket;