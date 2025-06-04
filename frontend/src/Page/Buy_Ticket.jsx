import React, { useState, useEffect } from 'react';
import Seat from '../ui/models/Seat';
import Bed from '../ui/models/Bed';
import '../styles/buy_ticket.css';
import { Trash } from 'lucide-react';
import stationService from '../data/Service/stationService';
import buyTicketService from '../data/Service/buyTicketService';
import trackService from '../data/Service/trackService';
// Set primary color
document.documentElement.style.setProperty('--primary-color', '#2563eb');

const Buy_Ticket = () => {
  // Form state for search inputs
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    departureDate: '',
    returnDate: '',
    departureTime: '',
    trainType: '',
    tripType: 'one-way',
  });

  // UI states
  const [isMobile, setIsMobile] = useState(false);
  const [availableTrains, setAvailableTrains] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [showSelectionPanel, setShowSelectionPanel] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [stations, setStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(true);
  const [stationError, setStationError] = useState(null);
  const [loadingTrains, setLoadingTrains] = useState(false);
  const [trainSearchError, setTrainSearchError] = useState(null);
  const [tracks, setTracks] = useState([]);
  // Static train and coach types (for fallback or testing)
  const trainTypes = [
    { id: 'SE1', direction: 'Bắc-Nam', startTime: '12:00', endTime: '04:00', duration: 16 },
    { id: 'SE2', direction: 'Nam-Bắc', startTime: '13:00', endTime: '05:00', duration: 16 },
    { id: 'SE3', direction: 'Bắc-Nam', startTime: '18:00', endTime: '10:00', duration: 16 },
    { id: 'SE4', direction: 'Nam-Bắc', startTime: '19:00', endTime: '11:00', duration: 16 },
    { id: 'SE5', direction: 'Bắc-Nam', startTime: '10:30', endTime: '02:30', duration: 16 },
    { id: 'SE6', direction: 'Nam-Bắc', startTime: '11:30', endTime: '03:30', duration: 16 },
    { id: 'SE7', direction: 'Bắc-Nam', startTime: '17:15', endTime: '09:15', duration: 16 },
    { id: 'SE8', direction: 'Nam-Bắc', startTime: '18:15', endTime: '10:15', duration: 16 },
  ];

  const coachTypes = [
    { id: 'room-4-bed', name: 'Room 4 beds, Air-Con', price: 1200000, type: 'bed', rows: 2, cols: 14 },
    { id: 'room-6-bed', name: 'Room 6 beds, Air-Con', price: 900000, type: 'bed', rows: 3, cols: 14 },
    { id: 'soft-seat', name: 'Soft seat, Air-Con', price: 700000, type: 'seat', rows: 4, cols: 14 },
    { id: 'hard-seat', name: 'Hard seat, Air-Con', price: 500000, type: 'seat', rows: 4, cols: 14 },
  ];

  // Handle responsive design
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Fetch stations on mount
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoadingStations(true);
        setStationError(null);
        const stationData = await stationService.getAllStations();
        setStations(stationData);

        const trackData = await trackService.getAllTracks();
        setTracks(trackData);
      } catch (error) {
        console.error('Failed to fetch stations:', error);
        setStationError('Failed to load stations. Please try again.');
        const fallbackStations = [
          { id: 'hanoi', name: 'Hà Nội' },
          { id: 'vinh', name: 'Vinh' },
          { id: 'hue', name: 'Huế' },
          { id: 'danang', name: 'Đà Nẵng' },
          { id: 'nhatrang', name: 'Nha Trang' },
          { id: 'saigon', name: 'Sài Gòn' },
        ];
        setStations(fallbackStations);
        setTracks([]);
      } finally {
        setLoadingStations(false);
      }
    };
    fetchStations();
  }, []);

  // Calculate distance between stations
  const calculateDistance = (fromStationId, toStationId) => {
    // Convert input values to numbers
    const start = Number(fromStationId);
    const end = Number(toStationId);

    if (start === end) return 0;

    // Get indices to determine direction
    const fromIndex = stations.findIndex(s => Number(s.stationID) === start);
    const toIndex = stations.findIndex(s => Number(s.stationID) === end);

    if (fromIndex === -1 || toIndex === -1) return 0;

    // Determine direction of travel
    const isForward = fromIndex < toIndex;

    // Get all station IDs between start and end (inclusive)
    const stationRange = stations
      .slice(Math.min(fromIndex, toIndex), Math.max(fromIndex, toIndex) + 1)
      .map(s => Number(s.stationID));

    // Calculate total distance by summing up track segments
    let totalDistance = 0;

    for (let i = 0; i < stationRange.length - 1; i++) {
      const currentStation = stationRange[i];
      const nextStation = stationRange[i + 1];

      // Find track between these stations (in either direction)
      const track = tracks.find(t =>
        (t.station1ID === currentStation && t.station2ID === nextStation) ||
        (t.station2ID === currentStation && t.station1ID === nextStation)
      );

      if (track) {
        totalDistance += track.distance;
      }
    }

    return totalDistance;
  };

  // Calculate return date based on distance
  const calculateReturnDate = (departureDate, distance) => {
    const date = new Date(departureDate);
    const days = Math.ceil((distance / 500) * 5); // 1 day per 500km
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const isTimeAfter = (time1, time2) => {
    const [h1, m1, s1] = time1.split(':').map(Number);
    const [h2, m2, s2] = time2.split(':').map(Number);
    return h1 > h2 || (h1 === h2 && (m1 > m2 || (m1 === m2 && s1 > s2)));
  };

  // Search trains with date correction for overnight journeys
  const searchTrains = async () => {
    const { from, to, departureTime, departureDate } = formData;

    if (!from || !to || from === to || !departureDate || !departureTime) {
      setTrainSearchError('Please fill in all required fields');
      return;
    }

    setLoadingTrains(true);
    setTrainSearchError(null);
    setAvailableTrains([]);
    setSelectedTrain(null);
    setSelectedCoach(null);
    setSelectedItems([]);
    setShowSearchResults(true);

    try {
      const fromId = parseInt(from);
      const toId = parseInt(to);
      const fromStation = stations.find(s => (s.id || s.stationID) === fromId);
      const toStation = stations.find(s => (s.id || s.stationID) === toId);

      if (!fromStation || !toStation) {
        throw new Error(`Station not found - From ID: ${fromId}, To ID: ${toId}`);
      }

      const timeToUse = `${departureTime}:00`;
      const fromStationName = fromStation.stationName || fromStation.name;
      const toStationName = toStation.stationName || toStation.name;

      const result = await buyTicketService.searchTrains(fromStationName, toStationName, timeToUse);

      if (result.success) {
        const distance = calculateDistance(fromId, toId);

        // Create maps to track dates and times
        const transformedTrains = result.data.map(train => {
          const scheduleID = train['Train Name'];
          const baseDate = new Date(departureDate);
          const stationDates = new Map(); // stationID -> date
          const lastDepartureTimeMap = new Map(); // For comparing time shifts per train
          const journeyPoints = Object.entries(train.journey || {})
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([_, station]) => ({
              stationId: station.stationID,
              arrivalTime: station.arrivalTime,
              departureTime: station.departureTime
            }));

          let currentDate = new Date(baseDate);

          journeyPoints.forEach((point, index) => {
            const { stationId, departureTime } = point;

            // Parse current and last departure times
            const currentTimeParts = departureTime.split(':').map(Number);
            const currentMinutes = currentTimeParts[0] * 60 + currentTimeParts[1];

            const lastTime = lastDepartureTimeMap.get(scheduleID);
            if (lastTime !== undefined && currentMinutes < lastTime) {
              // Time is earlier than the previous one — next day
              currentDate.setDate(currentDate.getDate() + 1);
            }

            // Update map and time tracker
            stationDates.set(stationId, new Date(currentDate));
            lastDepartureTimeMap.set(scheduleID, currentMinutes);
          });

          // Final transformation
          const departureStationDate = stationDates.get(fromId) || baseDate;
          const arrivalStationDate = stationDates.get(toId) || baseDate;

          return {
            id: scheduleID,
            direction: calculateDirection(fromId, toId),
            startTime: train['Departure Time'],
            endTime: train['Arrival Time'],
            duration: calculateDuration(
              `${departureStationDate.toISOString().split('T')[0]}T${train['Departure Time']}`,
              `${arrivalStationDate.toISOString().split('T')[0]}T${train['Arrival Time']}`
            ),
            distance: calculateDistance(fromId, toId),
            departureDate: departureStationDate.toISOString().split('T')[0],
            arrivalDate: arrivalStationDate.toISOString().split('T')[0],
            returnDate: calculateReturnDate(arrivalStationDate.toISOString().split('T')[0], calculateDistance(fromId, toId)),
            availableCapacity: train['Available Capacity'],
            stationDates: Object.fromEntries([...stationDates].map(([id, date]) => [
              id,
              date.toISOString().split('T')[0]
            ])),
            journey: journeyPoints.reduce((acc, point) => ({
              ...acc,
              [point.stationId]: {
                ...point,
                date: stationDates.get(point.stationId).toISOString().split('T')[0]
              }
            }), {})
          };
        });


        setAvailableTrains(transformedTrains);

        if (transformedTrains.length === 0) {
          setTrainSearchError('No trains found for the selected route and time');
        }
      } else {
        setTrainSearchError(result.message || 'Failed to search trains');
      }
    } catch (error) {
      console.error('Train search error:', error);
      setTrainSearchError(error.message || 'An error occurred while searching for trains');
    } finally {
      setLoadingTrains(false);
    }
  };

  const calculateDuration = (startDateTime, endDateTime) => {
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    let duration = (end - start) / (1000 * 60 * 60); // Convert to hours
    if (duration < 0) duration += 24;
    return Math.round(duration);
  };
  // Calculate direction based on station indices
  const calculateDirection = (fromId, toId) => {
    const fromIndex = stations.findIndex(s => (s.id || s.stationID) === fromId);
    const toIndex = stations.findIndex(s => (s.id || s.stationID) === toId);
    return fromIndex < toIndex ? 'Bắc-Nam' : 'Nam-Bắc';
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Train and coach selection handlers
  const handleSelectTrain = (train) => {
    setSelectedTrain(train);
    setSelectedCoach(null);
    setSelectedItems([]);
  };

  const handleSelectCoach = (coach) => {
    setSelectedCoach(coach);
    setSelectedItems([]);
  };

  // Handle seat/bed selection
  const handleSelectItem = (row, col) => {
    const key = `${row}-${col}`;
    const isBooked = Math.random() > 0.7; // Simulated booked status

    if (isBooked) return;

    setSelectedItems(prev => {
      const exists = prev.find(item => item.key === key);
      if (exists) {
        return prev.filter(item => item.key !== key);
      } else {
        setShowSelectionPanel(true);
        return [...prev, { key, row, col, price: selectedCoach.price }];
      }
    });
  };

  const removeSelectedItem = (key) => {
    setSelectedItems(prev => prev.filter(item => item.key !== key));
    if (selectedItems.length <= 1) {
      setShowSelectionPanel(false);
    }
  };

  // Render seats or beds based on coach type
  const renderSeatsOrBeds = () => {
    if (!selectedCoach) return null;
    return selectedCoach.type === 'seat' ? renderRegularCoach(selectedCoach) : renderSleeperCoach(selectedCoach);
  };

  const renderRegularCoach = (coach) => {
    const { rows, cols } = coach;
    const columns = [];

    for (let c = 0; c < cols; c++) {
      const columnSeats = [];
      const isAfterSeparator = c >= cols / 2;

      for (let r = 0; r < rows; r++) {
        const seatIndex = c * rows + r;
        const seatNumber = seatIndex + 1;
        const key = `${r}-${c}`;
        const booked = isItemBooked(r, c);
        const selected = selectedItems.some(item => item.key === key);
        const hovered = hoveredItem === key;

        if (r === 2 && rows >= 4) {
          columnSeats.push(<div key={`aisle-${c}-${r}`} className="h-[20px] w-full"></div>);
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
        );
      }

      if (c === Math.floor(cols / 2) - 1) {
        columns.push(<div key={`column-${c}`} className="seat-column">{columnSeats}</div>);
        columns.push(
          <div key={`separator-${c}`} className="column-separator">
            {isMobile ? (
              <>
                <div className="flex bg-gray-300 rounded-sm w-20 h-4"></div>
                <div className="flex-1"></div>
                <div className="flex bg-gray-300 rounded-sm w-20 h-4"></div>
              </>
            ) : (
              <>
                <div className="flex bg-gray-300 rounded-sm w-4 h-20"></div>
                <div className="flex-1"></div>
                <div className="flex bg-gray-300 rounded-sm w-4 h-20"></div>
              </>
            )}
          </div>
        );
      } else {
        columns.push(<div key={`column-${c}`} className="seat-column">{columnSeats}</div>);
      }
    }

    return <div className="coach-layout md:transform-none">{columns}</div>;
  };

  const renderSleeperCoach = (coach) => {
    const { rows, cols } = coach;
    const cabins = Math.ceil(cols / 2);
    const tiers = [];

    for (let row = 0; row < rows; row++) {
      const tierNumber = row + 1;
      tiers.push(<div key={`tier-label-${tierNumber}`} className="tier-label">T{tierNumber}</div>);
    }

    const cabinsLayout = [];

    for (let cabinIdx = 0; cabinIdx < cabins; cabinIdx++) {
      const cabinBeds = [];

      for (let col = 0; col < 2; col++) {
        const columnBeds = [];
        for (let row = 0; row < rows; row++) {
          const actualCol = cabinIdx * 2 + col;
          const key = `${row}-${actualCol}`;
          const bedNumber = isMobile ? actualCol * rows + row + 1 : actualCol * rows + row + 1;
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
          );
        }
        cabinBeds.push(<div key={`cabin-${cabinIdx}-column-${col}`} className="cabin-column">{columnBeds}</div>);
      }

      cabinsLayout.push(
        <div key={`cabin-${cabinIdx}`} className="mb-4">
          <div className="cabin-title">Cabin {cabinIdx + 1}</div>
          <div className="cabin-container border-blue-800">{cabinBeds}</div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center">
        {isMobile && <div className="tier-labels mb-2">{tiers}</div>}
        <div className="flex flex-row">
          {!isMobile && <div className="tier-labels">{tiers}</div>}
          <div className="cabins-grid md:transform-none">{cabinsLayout}</div>
        </div>
      </div>
    );
  };

  // Utility functions
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

  const today = new Date().toISOString().split('T')[0];

  const isItemBooked = (row, col) => {
    return ((row * 31 + col * 17) % 10) < 3; // Simulated booked status
  };

  // Render selection panel
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
            const itemNumber = item.col * selectedCoach.rows + item.row + 1;
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
                  <Trash />
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
          <button className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
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
                disabled={loadingStations}
                required
              >
                <option value="">{loadingStations ? 'Loading stations...' : 'Select departure station'}</option>
                {stations.map(station => (
                  <option key={station.id || station.stationID} value={station.id || station.stationID}>
                    {station.name || station.stationName}
                  </option>
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
                disabled={loadingStations}
                required
              >
                <option value="">{loadingStations ? 'Loading stations...' : 'Select arrival station'}</option>
                {stations.map(station => (
                  <option key={station.id || station.stationID} value={station.id || station.stationID}>
                    {station.name || station.stationName}
                  </option>
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
                required
              />
            </div>
            {/* Return Date */}
            {formData.tripType === 'round-trip' && (
              <div>
                <label className="form-field">Return Date</label>
                <input
                  type="date"
                  name="returnDate"
                  value={formData.returnDate}
                  onChange={handleInputChange}
                  min={formData.departureDate || today}
                  className="field-input"
                  required
                />
                <p className="text-xs mt-1">The return date is automatically calculated based on the distance</p>
              </div>
            )}
            {/* Departure Time */}
            <div>
              <label className="form-field">Departure Time</label>
              <input
                type="time"
                name="departureTime"
                value={formData.departureTime}
                onChange={handleInputChange}
                className="field-input"
                required
              />
            </div>
            {/* Search Button */}
            <div className="flex items-end">
              <button
                onClick={searchTrains}
                className="search-button"
                disabled={!formData.from || !formData.to || !formData.departureDate || !formData.departureTime || loadingTrains}
              >
                {loadingTrains ? 'Searching...' : 'Find Train'}
              </button>
            </div>
            {/* Error Display */}
            {trainSearchError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {trainSearchError}
              </div>
            )}
          </div>
        </div>
        {/* Available Trains */}
        {showSearchResults && (
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Available Trains</h2>
            {loadingTrains ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Searching for trains...</p>
              </div>
            ) : availableTrains.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {availableTrains.map(train => (
                  <div
                    key={train.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${selectedTrain?.id === train.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
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
                        <div className="text-gray-500">
                          {train.journey && train.journey[formData.from] ?
                            new Date(train.journey[formData.from].date).toLocaleDateString('vi-VN')
                            : new Date(train.departureDate).toLocaleDateString('vi-VN')} - {' '}
                          {formData.from && stations.find(s =>
                            (s.id || s.stationID) === parseInt(formData.from)
                          )?.stationName || 'Loading...'}
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center px-4">
                        <div className="text-gray-500 text-xs">{train.duration}h</div>
                        <div className="w-20 h-px bg-gray-300 my-1"></div>
                        <div className="text-gray-500 text-xs">{train.distance}km</div>
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{formatTime(train.endTime)}</div>
                        <div className="text-gray-500">
                          {train.journey && train.journey[formData.to] ?
                            new Date(train.journey[formData.to].date).toLocaleDateString('vi-VN')
                            : new Date(train.arrivalDate).toLocaleDateString('vi-VN')} - {' '}
                          {formData.to && stations.find(s =>
                            (s.id || s.stationID) === parseInt(formData.to)
                          )?.stationName || 'Loading...'}
                        </div>
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
            ) : (
              <div className="text-center py-8 text-gray-600">No trains found for the selected criteria</div>
            )}
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
                  className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all ${selectedCoach?.id === coach.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  onClick={() => handleSelectCoach(coach)}
                >
                  <h3 className="font-medium">{coach.name}</h3>
                  <div className="mt-2 font-semibold text-blue-600">{formatCurrency(coach.price)}</div>
                  <div className="mt-1 text-sm text-gray-500">{coach.type === 'seat' ? 'Seater' : 'Sleeper'}</div>
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
              <div className="seat-selection-container">{renderSeatsOrBeds()}</div>
            </div>
            {/* Booking Summary */}
            {selectedItems.length > 0 && (
              <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Booking Information</h3>
                <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-600">Train: {selectedTrain.id}</p>
                    <p className="text-sm text-gray-600">Coach: {selectedCoach.name}</p>
                    <p className="text-sm text-gray-600">
                      Journey: {stations.find(s => (s.id || s.stationID) === formData.from)?.name ||
                        stations.find(s => (s.id || s.stationID) === formData.from)?.stationName} →{' '}
                      {stations.find(s => (s.id || s.stationID) === formData.to)?.name ||
                        stations.find(s => (s.id || s.stationID) === formData.to)?.stationName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Departure: {new Date(selectedTrain.departureDate).toLocaleDateString('vi-VN')} at {formatTime(selectedTrain.startTime)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Arrival: {new Date(selectedTrain.arrivalDate).toLocaleDateString('vi-VN')} at {formatTime(selectedTrain.endTime)}
                    </p>
                    {formData.tripType === 'round-trip' && (
                      <p className="text-sm text-gray-600">
                        Return Date: {new Date(selectedTrain.returnDate).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Quantity: {selectedItems.length} {selectedCoach.type === 'seat' ? 'seats' : 'beds'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Number: {selectedItems.map(item => item.col * selectedCoach.rows + item.row + 1).join(', ')}
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