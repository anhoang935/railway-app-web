import React, { useState, useEffect } from 'react';
import Map from './Map';
import '../styles/timetable.css';
import { FaTrain, FaMapMarkerAlt, FaClock, FaAngleRight } from 'react-icons/fa';
import timetableService from '../data/Service/timetableService';

const Timetable = () => {
  // State variables
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [stations, setStations] = useState([]);
  const [availableTrains, setAvailableTrains] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [timetableData, setTimetableData] = useState([]);
  const [coachTypes, setCoachTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [routeStations, setRouteStations] = useState([]);
  const [error, setError] = useState('');
  const [tracks, setTracks] = useState([]);
  
  // Fetch stations on component mount
  // Updated fetch stations to ensure better error handling
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const data = await timetableService.getAllStations();
        setStations(data);
        console.log('Stations loaded from database:', data.length);
      } catch (error) {
        console.error('Failed to fetch stations:', error);
        setError('Failed to load stations. Please try again.');
        
        // Complete fallback data from the SQL dump with ALL stations
        setStations([
          { stationID: 1, stationName: 'Ha Noi' },
          { stationID: 2, stationName: 'Phu Ly' },
          { stationID: 3, stationName: 'Nam Dinh' },
          { stationID: 4, stationName: 'Ninh Binh' },
          { stationID: 5, stationName: 'Bim Son' },
          { stationID: 6, stationName: 'Thanh Hoa' },
          { stationID: 7, stationName: 'Minh Khoi' },
          { stationID: 8, stationName: 'Cho Sy' },
          { stationID: 9, stationName: 'Vinh' },
          { stationID: 10, stationName: 'Yen Trung' },
          { stationID: 11, stationName: 'Huong Pho' },
          { stationID: 12, stationName: 'Dong Le' },
          { stationID: 13, stationName: 'Dong Hoi' },
          { stationID: 14, stationName: 'Dong Ha' },
          { stationID: 15, stationName: 'Hue' },
          { stationID: 16, stationName: 'Lang Co' },
          { stationID: 17, stationName: 'Da Nang' },
          { stationID: 18, stationName: 'Tra Kieu' },
          { stationID: 19, stationName: 'Phu Cang' },
          { stationID: 20, stationName: 'Tam Ky' },
          { stationID: 21, stationName: 'Nui Thanh' },
          { stationID: 22, stationName: 'Quang Ngai' },
          { stationID: 23, stationName: 'Duc Pho' },
          { stationID: 24, stationName: 'Bong Son' },
          { stationID: 25, stationName: 'Dieu Tri' },
          { stationID: 26, stationName: 'Tuy Hoa' },
          { stationID: 27, stationName: 'Gia' },
          { stationID: 28, stationName: 'Ninh Hoa' },
          { stationID: 29, stationName: 'Nha Trang' },
          { stationID: 30, stationName: 'Nga Ba' },
          { stationID: 31, stationName: 'Thap Cham' },
          { stationID: 32, stationName: 'Song Mao' },
          { stationID: 33, stationName: 'Ma Lam' },
          { stationID: 34, stationName: 'Binh Thuan' },
          { stationID: 35, stationName: 'Long Khanh' },
          { stationID: 36, stationName: 'Bien Hoa' },
          { stationID: 37, stationName: 'Di An' },
          { stationID: 38, stationName: 'Sai Gon' }
        ]);
      } finally {
        setLoading(false);
      }
    };


    const fetchTracks = async () => {
      try {
        const data = await timetableService.getAllTracks();
        setTracks(data);
        console.log('Tracks loaded from database:', data.length);
      } catch (error) {
        console.error('Failed to fetch tracks:', error);
        // Fallback with empty tracks array - we'll use the distance calculation fallback
        setTracks([]);
      }
    };

    fetchStations();
    fetchTracks();
  }, []);
  
  // Fetch coach types
  useEffect(() => {
    const fetchCoachTypes = async () => {
      try {
        const data = await timetableService.getAllCoachTypes();
        setCoachTypes(data);
      } catch (error) {
        console.error('Failed to fetch coach types:', error);
        
        // Fallback data from the SQL dump
        setCoachTypes([
          { coach_typeID: 'CT01', type: 'Soft seat, Air-Con', price: '35000', capacity: 56 },
          { coach_typeID: 'CT02', type: 'Hard seat, Air-Con', price: '20000', capacity: 56 },
          { coach_typeID: 'CT03', type: 'Room 4 beds, Air-Con', price: '120000', capacity: 28 },
          { coach_typeID: 'CT04', type: 'Room 6 beds, Air-Con', price: '90000', capacity: 42 }
        ]);
      }
    };

    fetchCoachTypes();
  }, []);
  
  // Calculate distance between two station IDs using the track data
  const calculateDistance = (startStationId, endStationId) => {
    // If we have track data, use it
    if (tracks.length > 0) {
      const track = tracks.find(t => 
        (t.station1ID === startStationId && t.station2ID === endStationId) || 
        (t.station1ID === endStationId && t.station2ID === startStationId)
      );
      if (track) return track.distance;
    }
    
    // Fallback: calculate approximate distance based on station IDs
    return Math.abs(startStationId - endStationId) * 100;
  };
  
  // Search trains function
  const searchTrains = async () => {
    if (!fromStation || !toStation || fromStation === toStation) {
      setError('Please select different departure and arrival stations');
      return;
    }
    
    // Validate departure date is today or in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(departureDate);
    if (selectedDate < today) {
      setError('Departure date cannot be in the past');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const params = {
        departureStation: stations.find(s => s.stationID === parseInt(fromStation))?.stationName,
        arrivalStation: stations.find(s => s.stationID === parseInt(toStation))?.stationName,
        departureDate: departureDate
      };
      
      const result = await timetableService.searchTrains(params);
      
      if (!result.data || result.data.length === 0) {
        setError('No trains found for this route. Please try different stations or date.');
        setAvailableTrains([]);
      } else {
        // Format the train data
        const trains = result.data.map(train => ({
          id: train['Train Name'] || train.trainName,
          trainName: train['Train Name'] || train.trainName,
          trainID: train.trainID,
          availableCapacity: train['Available Capacity'] || train.availableCapacity || 'Unknown',
          departureTime: train['Departure Time'] || train.departureTime,
          arrivalTime: train['Arrival Time'] || train.arrivalTime
        }));
        
        setAvailableTrains(trains);
        setSelectedTrain(null);
        setTimetableData([]);
      }
    } catch (error) {
      console.error('Error searching trains:', error);
      
      // Fallback for development/testing
      if (process.env.NODE_ENV === 'development') {
        // Create mock data for testing
        const mockTrains = [
          {
            id: 'SE1',
            trainName: 'SE1',
            trainID: 1,
            availableCapacity: 364,
            departureTime: fromStation < toStation ? '20:55:00' : '20:35:00',
            arrivalTime: fromStation < toStation ? '05:45:00' : '05:55:00'
          }
        ];
        setAvailableTrains(mockTrains);
      } else {
        setError('Failed to search for trains. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Handle train selection
  const handleSelectTrain = async (train) => {
    try {
      setLoading(true);
      setSelectedTrain(train);
      
      // Convert to numbers for proper comparison
      const fromStationId = parseInt(fromStation);
      const toStationId = parseInt(toStation);
      
      // Fetch route stations and timetable
      // Instead of getting schedules between selected stations, get the complete route
      const schedules = await timetableService.getSchedulesBetweenStations(1, 38); // Ha Noi (1) to Sai Gon (38)
      
      // Find the schedule for this specific train
      const schedule = schedules.find(s => s.trainName === train.trainName || s.trainID === train.trainID);
      
      if (!schedule) {
        setError('Could not find detailed schedule for this train');
        setTimetableData([]);
        setRouteStations([]);
        return;
      }
      
      // Get all stations on this route
      const allJourneys = await timetableService.getJourneysBySchedule(schedule.scheduleID);
      
      // Sort journeys by their order in the schedule
      const journeys = [...allJourneys].sort((a, b) => {
        return parseInt(a.journeyID) - parseInt(b.journeyID);
      });
      
      // Format timetable data
      let cumulativeDistance = 0;
      const stationData = journeys.map((journey, index) => {
        const stationObj = stations.find(s => parseInt(s.stationID) === parseInt(journey.stationID));
        
        // Calculate distance from the previous station
        let distanceFromPrevious = 0;
        if (index > 0) {
          const prevStationId = parseInt(journeys[index - 1].stationID);
          const currentStationId = parseInt(journey.stationID);
          distanceFromPrevious = calculateDistance(prevStationId, currentStationId);
          cumulativeDistance += distanceFromPrevious;
        }
        
        return {
          station: stationObj?.stationName || 'Unknown Station',
          stationID: journey.stationID,
          distance: cumulativeDistance.toString(),
          date: new Date(departureDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }),
          arrival: journey.arrivalTime || (index === 0 ? '-' : ''),
          departure: journey.departureTime || (index === journeys.length - 1 ? '-' : '')
        };
      });
      
      setTimetableData(stationData);
      
      // Prepare data for the route map - include ALL stations
      setRouteStations(journeys.map(j => {
        const station = stations.find(s => parseInt(s.stationID) === parseInt(j.stationID));
        return { 
          id: j.stationID,
          name: station?.stationName || 'Unknown',
          isEndpoint: parseInt(j.stationID) === fromStationId || parseInt(j.stationID) === toStationId
        };
      }));
    } catch (error) {
      console.error('Error fetching train details:', error);
      
      // Fallback for development/testing
      if (process.env.NODE_ENV === 'development') {
        // Use all stations from our database for fallback
        const mockJourneys = stations
          .sort((a, b) => parseInt(a.stationID) - parseInt(b.stationID))
          .map((station, index) => {
            // Calculate mock times
            const baseHour = 20; // Starting at 8 PM
            const hourIncrement = index * 0.5; // 30 mins between stations
            const departureHour = (baseHour + hourIncrement) % 24;
            const arrivalHour = (departureHour - 0.1 + 24) % 24; // 6 min earlier
            
            const formatTime = (hour) => {
              const hourStr = Math.floor(hour).toString().padStart(2, '0');
              const minStr = Math.floor((hour % 1) * 60).toString().padStart(2, '0');
              return `${hourStr}:${minStr}:00`;
            };
            
            return {
              stationID: station.stationID,
              stationName: station.stationName,
              distance: index * 50, // Approximate distance
              arrival: formatTime(arrivalHour),
              departure: formatTime(departureHour)
            };
          });
        
        // Set mock route data for all stations
        setTimetableData(mockJourneys.map((journey, index) => ({
          station: journey.stationName,
          stationID: journey.stationID,
          distance: journey.distance.toString(),
          date: new Date(departureDate || new Date()).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }),
          arrival: journey.arrival || (index === 0 ? '-' : ''),
          departure: journey.departure || (index === mockJourneys.length - 1 ? '-' : '')
        })));
        
        // Set route stations data for the map
        setRouteStations(mockJourneys.map(j => ({
          id: j.stationID,
          name: j.stationName,
          isEndpoint: parseInt(j.stationID) === parseInt(fromStation) || parseInt(j.stationID) === parseInt(toStation)
        })));
      } else {
        setError('Failed to load train details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Format price
  const formatPrice = (price) => {
    return parseInt(price).toLocaleString('vi-VN') + ' VND';
  };

  // Render route selection form
  const renderRouteSelection = () => (
    <div className="route-selection">
      <h2>Train Route Selection</h2>
      <form className="route-form" onSubmit={(e) => { 
        e.preventDefault();
        searchTrains();
      }}>
        <div className="form-group">
          <label>From:</label>
          <select
            value={fromStation}
            onChange={(e) => setFromStation(e.target.value)}
            required
          >
            <option value="">Select departure station</option>
            {stations.map(station => (
              <option key={station.stationID} value={station.stationID}>
                {station.stationName}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>To:</label>
          <select
            value={toStation}
            onChange={(e) => setToStation(e.target.value)}
            required
          >
            <option value="">Select arrival station</option>
            {stations.map(station => (
              <option 
                key={station.stationID} 
                value={station.stationID}
                disabled={parseInt(station.stationID) === parseInt(fromStation)}
              >
                {station.stationName}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Date:</label>
          <input
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        
        <div className="form-group">
          <button 
            type="submit" 
            className="search-button"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Find Trains'}
          </button>
        </div>
      </form>
    </div>
  );

  // Render train options
  const renderTrainOptions = () => {
    if (!availableTrains.length) return null;
    
    return (
      <div className="train-options">
        <h3>Available Trains</h3>
        <div className="train-list">
          {availableTrains.map(train => (
            <div 
              key={train.id}
              className={`train-option ${selectedTrain?.id === train.id ? 'selected' : ''}`}
              onClick={() => handleSelectTrain(train)}
            >
              <div className="train-header">
                <h4><FaTrain className="icon" /> {train.trainName}</h4>
                <span className="capacity">{train.availableCapacity} seats available</span>
              </div>
              <div className="train-schedule">
                <div className="departure">
                  <span className="time">{train.departureTime}</span>
                  <span className="station">{stations.find(s => parseInt(s.stationID) === parseInt(fromStation))?.stationName}</span>
                </div>
                <div className="journey-line">
                  <FaAngleRight />
                </div>
                <div className="arrival">
                  <span className="time">{train.arrivalTime}</span>
                  <span className="station">{stations.find(s => parseInt(s.stationID) === parseInt(toStation))?.stationName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render timetable
  const renderTimetable = () => {
    if (!selectedTrain || !timetableData.length) return null;
    
    return (
      <div className="timetable">
        <h3>Train Timetable - {selectedTrain.trainName}</h3>
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
            {timetableData.map((row, index) => (
              <tr key={index} className={(parseInt(row.stationID) === parseInt(fromStation) || parseInt(row.stationID) === parseInt(toStation)) ? 'highlighted-row' : ''}>
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
    );
  };

  // Render coach types
  const renderCoachTypes = () => {
    if (!selectedTrain) return null;
    
    return (
      <div className="timetable coach-types">
        <h3>Available Coach Types</h3>
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Coach Type</th>
              <th>Price</th>
              <th>Capacity</th>
            </tr>
          </thead>
          <tbody>
            {coachTypes.map((coach, index) => (
              <tr key={coach.coach_typeID}>
                <td>{index + 1}</td>
                <td>{coach.type}</td>
                <td>{formatPrice(coach.price)}</td>
                <td>{coach.capacity} seats per coach</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="timetable-container">
      {renderRouteSelection()}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {loading && (
        <div className="loading-container">
          <div className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )}
      
      {renderTrainOptions()}
      
      {selectedTrain && (
        <div className="content-section">
          <div className="map-section">
            <h3>Route Map</h3>
            <Map 
              stations={routeStations}
              fromStation={fromStation} 
              toStation={toStation}
            />
          </div>
          <div className="info-section">
            {renderTimetable()}
            {renderCoachTypes()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;