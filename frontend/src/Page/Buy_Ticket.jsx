import React, { useState, useEffect, use } from 'react';
import { useNavigate } from 'react-router-dom';
import Seat from '../ui/models/Seat';
import Bed from '../ui/models/Bed';
import '../styles/buy_ticket.css';
import { Trash } from 'lucide-react';
import stationService from '../data/Service/stationService';
import buyTicketService from '../data/Service/buyTicketService';
import trackService from '../data/Service/trackService';
import timetableService from '../data/Service/timetableService';
import coachTypeService from '../data/Service/coachTypeService';
import coachService from '../data/Service/coachService';
import Checkout from './Checkout';

// Set primary color
document.documentElement.style.setProperty('--primary-color', '#2563eb');

const Buy_Ticket = () => {
  const navigate = useNavigate();
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
  const [returnTrains, setReturnTrains] = useState([]);
  const [selectedReturnTrain, setSelectedReturnTrain] = useState(null);
  const [loadingReturnTrains, setLoadingReturnTrains] = useState(false);
  const [showReturnTrainSelection, setShowReturnTrainSelection] = useState(false);
  const [selectedReturnCoach, setSelectedReturnCoach] = useState(null);
  const [selectedReturnItems, setSelectedReturnItems] = useState([]);
  const [coachTypes, setCoachTypes] = useState([]);
  const [trainCoaches, setTrainCoaches] = useState([]);
  const [returnTrainCoaches, setReturnTrainCoaches] = useState([]);
  const [loadingCoaches, setLoadingCoaches] = useState(false);
  const [returnFormData, setReturnFormData] = useState({
    departureDate: '',
    departureTime: ''
  });
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

  // Fetch coach types on mount
  useEffect(() => {
    const fetchCoachTypes = async () => {
      try {
        const types = await coachTypeService.getAllCoachTypes();
        // Transform coach types to include UI configuration
        const transformedTypes = types.map(type => ({
          id: type.coach_typeID,
          name: type.type,
          price: type.price,
          capacity: type.capacity,
          type: type.type.toLowerCase().includes('bed') ? 'bed' : 'seat',
          // Configure rows and cols based on capacity
          rows: type.type.toLowerCase().includes('bed') ?
            (type.type.includes('4') ? 2 : 3) : 4,
          cols: Math.ceil(type.capacity / (type.type.toLowerCase().includes('bed') ?
            (type.type.includes('4') ? 2 : 3) : 4))
        }));
        setCoachTypes(transformedTypes);
      } catch (error) {
        console.error('Failed to fetch coach types:', error);
      }
    };
    fetchCoachTypes();
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

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Search trains with date correction for overnight journeys
  const searchTrains = async () => {
    const { from, to, departureTime, departureDate, tripType, returnDate } = formData;

    // Validation
    if (!from || !to || from === to || !departureDate || !departureTime) {
      setTrainSearchError('Please fill in all required fields');
      return;
    }

    if (tripType === 'round-trip' && !returnDate) {
      setTrainSearchError('Please select a return date for round-trip');
      return;
    }

    // Reset states
    setLoadingTrains(true);
    setTrainSearchError(null);
    setAvailableTrains([]);
    setReturnTrains([]);
    setSelectedTrain(null);
    setSelectedCoach(null);
    setSelectedItems([]);
    setSelectedReturnTrain(null);
    setSelectedReturnCoach(null);
    setSelectedReturnItems([]);
    setShowSearchResults(true);

    try {
      // Search outbound trains first
      const outboundTrains = await searchJourneyTrains({
        fromId: parseInt(from),
        toId: parseInt(to),
        departureDate,
        departureTime
      });

      setAvailableTrains(outboundTrains);

      // Only search for return trains if:
      // 1. It's a round trip
      // 2. There are available outbound trains
      if (tripType === 'round-trip' && outboundTrains.length > 0) {
        setLoadingReturnTrains(true);
        const returnJourneyTrains = await searchJourneyTrains({
          fromId: parseInt(to),
          toId: parseInt(from),
          departureDate: returnDate,
          departureTime: '00:00:00'
        });
        setReturnTrains(returnJourneyTrains);
        setLoadingReturnTrains(false);
      }

    } catch (error) {
      console.error('Train search error:', error);
      setTrainSearchError(error.message || 'An error occurred while searching for trains');
    } finally {
      setLoadingTrains(false);
    }
  };

  // Helper function to search trains for a journey (either outbound or return)
  const searchJourneyTrains = async ({ fromId, toId, departureDate, departureTime }) => {
    // Find station details
    const fromStation = stations.find(s => (s.id || s.stationID) === fromId);
    const toStation = stations.find(s => (s.id || s.stationID) === toId);

    if (!fromStation || !toStation) {
      throw new Error(`Station not found - From ID: ${fromId}, To ID: ${toId}`);
    }

    const fromStationName = fromStation.stationName || fromStation.name;
    const toStationName = toStation.stationName || toStation.name;

    // Search trains
    const result = await buyTicketService.searchTrains(
      fromStationName,
      toStationName,
      `${departureTime}:00`
    );

    if (!result.success) {
      throw new Error(result.message || 'Failed to search trains');
    }

    // Transform train data with schedules
    const transformedTrains = await Promise.all(result.data.map(async train => {
      try {
        // Get complete schedule
        const schedules = await timetableService.getSchedulesBetweenStations(1, 38);
        const schedule = schedules.find(s => s.trainName === train['Train Name']);

        if (!schedule) return null;

        // Get journey points
        const allJourneys = await timetableService.getJourneysBySchedule(schedule.scheduleID);
        const journeys = [...allJourneys].sort((a, b) => parseInt(a.journeyID) - parseInt(b.journeyID));

        // Find departure journey
        const departureJourney = journeys.find(j => parseInt(j.stationID) === parseInt(fromId));
        if (!departureJourney) return null;

        // Calculate journey dates and times
        const journeyWithDates = calculateJourneyDates({
          journeys,
          fromId,
          toId,
          departureJourney,
          startDate: departureDate
        });

        // Get departure and arrival info
        const departureInfo = journeyWithDates[fromId];
        const arrivalInfo = journeyWithDates[toId];

        // Debug logging with correct station order
        console.log(`\n=== Train ${train['Train Name']} Journey Details ===`);
        console.log(`Direction: ${calculateDirection(fromId, toId)}`);
        console.log('Full journey timeline:');

        // Get stations in journey order (same logic as calculateJourneyDates)
        const fromIndex = journeys.findIndex(j => parseInt(j.stationID) === parseInt(fromId));
        const toIndex = journeys.findIndex(j => parseInt(j.stationID) === parseInt(toId));
        const isForward = fromIndex < toIndex;

        const orderedJourneyStations = isForward
          ? journeys.slice(fromIndex, toIndex + 1)
          : journeys.slice(toIndex, fromIndex + 1).reverse();

        // Display stations in correct order
        orderedJourneyStations.forEach(journey => {
          const stationInfo = journeyWithDates[journey.stationID];
          const station = stations.find(s =>
            (s.id || s.stationID) === parseInt(journey.stationID)
          );

          if (stationInfo) {
            console.log(
              `Station: ${station?.stationName || station?.name || journey.stationID}`,
              `\n  Date: ${stationInfo.date}`,
              `\n  Arrival: ${stationInfo.arrivalTime}`,
              `\n  Departure: ${stationInfo.departureTime}`
            );
          }
        });

        console.log('Calculated journey info:');
        console.log('  Start:', `${departureInfo?.date} ${departureInfo?.departureTime}`);
        console.log('  End:', `${arrivalInfo?.date} ${arrivalInfo?.arrivalTime}`);
        console.log('  Duration:', `${calculateDuration(
          `${departureInfo?.date}T${departureInfo?.departureTime}`,
          `${arrivalInfo?.date}T${arrivalInfo?.arrivalTime}`
        )}h`);
        console.log('===================================\n');

        // Return transformed train data
        return {
          id: train['Train Name'],
          direction: calculateDirection(fromId, toId),
          startTime: departureInfo?.departureTime || train['Departure Time'],
          endTime: arrivalInfo?.arrivalTime || train['Arrival Time'],
          duration: calculateDuration(
            `${departureInfo?.date}T${departureInfo?.departureTime}`,
            `${arrivalInfo?.date}T${arrivalInfo?.arrivalTime}`
          ),
          distance: calculateDistance(fromId, toId),
          departureDate: departureInfo?.date || departureDate,
          arrivalDate: arrivalInfo?.date,
          availableCapacity: train['Available Capacity'],
          journey: journeyWithDates
        };
      } catch (error) {
        console.error('Error processing train schedule:', error);
        return null;
      }
    }));

    // Filter out failed transformations
    return transformedTrains.filter(train => train !== null);
  };

  // Helper function to calculate dates for each station in journey
  const calculateJourneyDates = ({ journeys, fromId, toId, departureJourney, startDate }) => {
    const journeyWithDates = {};

    // Find journey indices
    const fromIndex = journeys.findIndex(j => parseInt(j.stationID) === parseInt(fromId));
    const toIndex = journeys.findIndex(j => parseInt(j.stationID) === parseInt(toId));

    if (fromIndex === -1 || toIndex === -1) {
      console.error('Station not found in journey:', { fromId, toId, fromIndex, toIndex });
      return journeyWithDates;
    }

    const isForward = fromIndex < toIndex;

    // Get stations in the correct order for this journey
    const relevantJourneys = isForward
      ? journeys.slice(fromIndex, toIndex + 1)
      : journeys.slice(toIndex, fromIndex + 1).reverse();

    // Initialize with start date and reference time
    const startDateObj = new Date(startDate);
    let currentDate = new Date(startDate);
    let dayOffset = 0;
    let referenceTimeMinutes = timeToMinutes(relevantJourneys[0].departureTime || relevantJourneys[0].arrivalTime);

    // Process each station in journey order
    relevantJourneys.forEach((journey, index) => {
      const currentTimeMinutes = timeToMinutes(journey.arrivalTime);

      // Check if we need to increment the day
      if (index > 0) {
        // If current time is less than reference time, we've crossed midnight
        if (currentTimeMinutes < referenceTimeMinutes) {
          dayOffset++;
          referenceTimeMinutes = currentTimeMinutes; // Reset reference time
        } else if (currentTimeMinutes - referenceTimeMinutes > 720) {
          // If time difference is more than 12 hours in the future,
          // we probably went backwards across midnight
          dayOffset--;
          referenceTimeMinutes = currentTimeMinutes;
        } else {
          referenceTimeMinutes = currentTimeMinutes;
        }
      }

      // Calculate the date for this station
      const stationDate = new Date(startDateObj);
      stationDate.setDate(startDateObj.getDate() + dayOffset);

      // Store journey information
      journeyWithDates[journey.stationID] = {
        stationID: journey.stationID,
        arrivalTime: journey.arrivalTime,
        departureTime: journey.departureTime || journey.arrivalTime,
        date: stationDate.toISOString().split('T')[0]
      };
    });

    return journeyWithDates;
  };

  const calculateDuration = (startDateTime, endDateTime) => {
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    // Calculate duration in hours
    let duration = (end - start) / (1000 * 60 * 60);

    // If both times are on the same day
    if (start.toDateString() === end.toDateString()) {
      // Simple time difference
      duration = duration < 0 ? duration + 24 : duration;
    }

    // Round to nearest hour or half hour
    return Math.round(duration * 2) / 2;
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
  const handleSelectTrain = async (train, isReturn = false) => {
    if (isReturn) {
      setSelectedReturnTrain(train);
      setSelectedReturnCoach(null);
      setSelectedReturnItems([]);
      await fetchTrainCoaches(train.id, true); // Pass true for return journey
    } else {
      setSelectedTrain(train);
      setSelectedCoach(null);
      setSelectedItems([]);
      await fetchTrainCoaches(train.id, false); // Pass false for outbound journey
    }
  };
  const calculatePriceByDistance = (distance, coachTypeId) => {
    const coachType = coachTypes.find(type => type.id === coachTypeId);
    const basePrice = coachType ? coachType.price : 40000;
    if (distance <= 0) return 0;
    else if (distance <= 40) return basePrice;
    else if (distance <= 50) return Math.round(basePrice * 1.075);
    else if (distance <= 60) return Math.round(basePrice * 1.2);
    else if (distance <= 80) return Math.round(basePrice * 1.4);
    else if (distance <= 100) return Math.round(basePrice * 2.675);
    else if (distance <= 120) return Math.round(basePrice * 3.075);
    else {
      const price = basePrice + (distance * 605);
      return Math.round(price / 1000) * 1000;
    }
  }
  const fetchTrainCoaches = async (trainId, isReturn = false) => {
    try {
      setLoadingCoaches(true);
      const response = await buyTicketService.getCoachesByTrainName(trainId);

      console.log('API Response:', response); // Debug log

      // Handle different response structures
      let coaches;
      if (response.data) {
        coaches = Array.isArray(response.data) ? response.data : [];
      } else {
        coaches = Array.isArray(response) ? response : [];
      }

      console.log('Processed coaches:', coaches); // Debug log
      coaches.sort((a, b) => a.coachID - b.coachID);
      const groupedCoaches = coaches.reduce((acc, coach, index) => {
        const coachType = coachTypes.find(type => type.id === coach.coach_typeID);
        if (coachType) {
          return [...acc, {
            ...coachType,
            displayId: index + 1,
            coachID: coach.coachID,
            originalCoachID: coach.coachID,
            trainID: coach.trainID,
            name: coach.name || coachType.name
          }];
        }
        return acc;
      }, []);

      // Set the appropriate coaches state based on isReturn flag
      if (isReturn) {
        setReturnTrainCoaches(groupedCoaches);
      } else {
        setTrainCoaches(groupedCoaches);
      }
    } catch (error) {
      console.error('Failed to fetch train coaches:', error);
      // Clear the appropriate coaches state based on isReturn flag
      if (isReturn) {
        setReturnTrainCoaches([]);
      } else {
        setTrainCoaches([]);
      }
    } finally {
      setLoadingCoaches(false);
    }
  };

  const handleSelectCoach = (coach, isReturn = false) => {
    if (isReturn) {
      if (!selectedReturnCoach || selectedReturnCoach.trainID !== coach.trainID) {
        setSelectedReturnItems([]);
      }
      setSelectedReturnCoach(coach);
      setShowSelectionPanel(true);
    } else {
      if (!selectedCoach || selectedCoach.trainID !== coach.trainID) {
        setSelectedItems([]);
      }
      setSelectedCoach(coach);
      setShowSelectionPanel(true);
    }
  };

  // Handle seat/bed selection
  const handleSelectItem = (row, col, isReturn = false) => {
    const coach = isReturn ? selectedReturnCoach : selectedCoach;
    const train = isReturn ? selectedReturnTrain : selectedTrain;
    if (!coach || !train) return;
    //const key = `${row}-${col}`;

    const key = `${train.id}-${coach.coachID}-${row}-${col}`;
    if (isReturn) {
      // const coach = selectedReturnCoach; // Use return coach
      // const train = selectedReturnTrain; // Use return train
      // if (!coach || !train) return;

      const distance = calculateDistance(parseInt(formData.to), parseInt(formData.from));
      const itemPrice = calculatePriceByDistance(distance, coach.id);

      setSelectedReturnItems(prev => {
        const exists = prev.find(item =>
          item.trainId === train.id &&
          item.coachId === coach.coachID &&
          item.row === row &&
          item.col === col
        );
        if (exists) {
          return prev.filter(item => item.key !== key);
        } else {
          setShowSelectionPanel(true);
          return [...prev, {
            key,
            row,
            col,
            price: itemPrice,
            coachId: coach.coachID,
            trainId: train.id,
            coachName: `#${coach.coachID} - ${coach.name}`,
            coachType: coach.type
          }];
        }
      });
    } else {
      // const coach = selectedCoach; // Use outbound coach
      // const train = selectedTrain; // Use outbound train
      // if (!coach || !train) return;

      const distance = calculateDistance(parseInt(formData.from), parseInt(formData.to));
      const itemPrice = calculatePriceByDistance(distance, coach.id);
      setSelectedItems(prev => {
        const exists = prev.find(item =>
          item.trainId === train.id &&
          item.coachId === coach.coachID &&
          item.row === row &&
          item.col === col
        );
        if (exists) {
          return prev.filter(item => item.key !== key);
        } else {
          setShowSelectionPanel(true);
          return [...prev, {
            key,
            row,
            col,
            price: itemPrice,
            coachId: coach.coachID,
            trainId: train.id,
            coachName: `#${coach.coachID} - ${coach.name}`, // Store full coach name
            coachType: coach.type
          }];
        }
      });
    }
  };

  const removeSelectedItem = (key) => {
    setSelectedItems(prev => prev.filter(item => item.key !== key));
    if (selectedItems.length <= 1) {
      setShowSelectionPanel(false);
    }
  };

  // Render seats or beds based on coach type
  const renderSeatsOrBeds = (isReturn = false) => {
    const coach = isReturn ? selectedReturnCoach : selectedCoach;
    if (!coach) return null;
    return coach.type === 'seat'
      ? renderRegularCoach(coach, isReturn)
      : renderSleeperCoach(coach, isReturn);
  };

  const renderRegularCoach = (coach, isReturn = false) => {
    if (!coach) return null;
    const { rows, cols } = coach;
    const columns = [];

    const relevantItems = (isReturn ? selectedReturnItems : selectedItems)
      .filter(item => item.coachId === coach.coachID);

    for (let c = 0; c < cols; c++) {
      const columnSeats = [];
      const isAfterSeparator = c >= cols / 2;

      for (let r = 0; r < rows; r++) {
        const key = `${r}-${c}`;
        const seatNumber = c * rows + r + 1;
        const selected = relevantItems.some(item =>
          item.trainId === (isReturn ? selectedReturnTrain : selectedTrain).id &&
          item.coachId === coach.coachID &&
          item.row === r &&
          item.col === c
        );
        const hovered = hoveredItem === key;

        if (r === 2 && rows >= 4) {
          columnSeats.push(<div key={`aisle-${c}-${r}`} className="h-[20px] w-full"></div>);
        }
        const distance = isReturn
          ? calculateDistance(parseInt(formData.to), parseInt(formData.from))
          : calculateDistance(parseInt(formData.from), parseInt(formData.to));
        const seatPrice = calculatePriceByDistance(distance, coach.id);
        columnSeats.push(
          <div key={key} onClick={() => handleSelectItem(r, c, isReturn)}>
            <Seat
              seatNumber={seatNumber}
              price={formatCurrency(seatPrice)}
              isBooked={false}
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

  const renderSleeperCoach = (coach, isReturn = false) => {
    const { rows, cols } = coach;
    const cabins = Math.ceil(cols / 2);
    const tiers = [];

    const relevantItems = (isReturn ? selectedReturnItems : selectedItems)
      .filter(item => item.coachId === coach.coachID);
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
          const selected = relevantItems.some(item =>
            item.trainId === (isReturn ? selectedReturnTrain : selectedTrain).id &&
            item.coachId === coach.coachID &&
            item.row === row &&
            item.col === actualCol
          );
          const hovered = hoveredItem === key;
          const tierNumber = rows - row;

          const distance = isReturn
            ? calculateDistance(parseInt(formData.to), parseInt(formData.from))
            : calculateDistance(parseInt(formData.from), parseInt(formData.to));
          const bedPrice = calculatePriceByDistance(distance, coach.id);
          columnBeds.push(
            <div key={key} className="bed-container">
              <div onClick={() => handleSelectItem(row, actualCol, isReturn)}>
                <Bed
                  bedNumber={bedNumber}
                  tierNumber={tierNumber}
                  price={formatCurrency(bedPrice)}
                  isBooked={false}
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
    const outboundPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);
    const returnPrice = selectedReturnItems.reduce((sum, item) => sum + item.price, 0);
    return formData.tripType === 'round-trip' ? outboundPrice + returnPrice : outboundPrice;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';

    const timeParts = timeStr.split(':');
    if (timeParts.length >= 2) {
      const hours = timeParts[0].padStart(2, '0');
      const minutes = timeParts[1].padStart(2, '0');
      return `${hours}:${minutes}`;
    }

    return timeStr;
  };

  const today = new Date().toISOString().split('T')[0];

  // Render selection panel
  const renderSelectionPanel = () => {
    if (!showSelectionPanel || !selectedItems.length || !selectedCoach || !selectedTrain) return null;

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

        {/* Outbound Journey Items */}
        {selectedItems.length > 0 && selectedTrain && (
          <div className="mb-4">
            {Object.entries(
              selectedItems.reduce((acc, item) => {
                const key = `${item.trainId}-${item.coachId}`;
                if (!acc[key]) {
                  acc[key] = {
                    items: [],
                    coachName: item.coachName,
                    trainId: item.trainId
                  };
                }
                acc[key].items.push(item);
                return acc;
              }, {})
            ).map(([key, group]) => (
              <div key={key} className="mb-4">
                <div className="bg-blue-50 p-2 rounded mb-2">
                  <p className="text-sm font-medium text-blue-700">Train {group.trainId}</p>
                  <p className="text-xs text-blue-600">{group.coachName}</p>
                </div>
                <div className="divide-y">
                  {group.items.map(item => {
                    const itemNumber = item.col * selectedCoach.rows + item.row + 1;
                    return (
                      <div key={item.key} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <div>
                          <span className="text-sm font-medium">
                            {selectedCoach.type === 'seat' ? 'Seat' : 'Bed'} #{itemNumber}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            (Row {item.row + 1}, Column {item.col + 1})
                          </span>
                        </div>
                        <span className="text-sm text-blue-600">{formatCurrency(item.price)}</span>
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
              </div>
            ))}
          </div>
        )}

        {/* Return Journey Items */}
        {selectedReturnItems.length > 0 && selectedReturnTrain && selectedReturnCoach && (
          <div className="mb-4">
            <div className="bg-blue-50 p-2 rounded mb-2">
              <p className="text-sm font-medium text-blue-700">Return Train {selectedReturnTrain.id}</p>
              <p className="text-xs text-blue-600">Coach #{selectedReturnCoach.coachID} - {selectedReturnCoach.name}</p>
            </div>
            <div className="divide-y">
              {selectedReturnItems
                .filter(item => item.trainId === selectedReturnTrain.id && item.coachId === selectedReturnCoach.coachID)
                .map(item => {
                  const itemNumber = item.col * selectedReturnCoach.rows + item.row + 1;
                  return (
                    <div key={item.key} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <div>
                        <span className="text-sm font-medium">
                          {selectedReturnCoach.type === 'seat' ? 'Seat' : 'Bed'} #{itemNumber}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          (Row {item.row + 1}, Column {item.col + 1})
                        </span>
                      </div>
                      <span className="text-sm text-blue-600">{formatCurrency(item.price)}</span>
                      <button
                        onClick={() => removeSelectedReturnItem(item.key)}
                        className="text-red-500 hover:text-red-700"
                        aria-label="Remove item"
                      >
                        <Trash />
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        <div className="mt-4 pt-2 border-t">
          <div className="total-section">
            <span>Total:</span>
            <span className="font-semibold">{formatCurrency(calculateTotalPrice())}</span>
          </div>
          <button
            onClick={handleProceedToCheckout}
            className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Continue
          </button>
        </div>
      </div>
    );
  };

  const removeSelectedReturnItem = (key) => {
    setSelectedReturnItems(prev => prev.filter(item => item.key !== key));
    if (selectedReturnItems.length <= 1) {
      setShowSelectionPanel(false);
    }
  };

  // Add new state at the top with other states
  const [showCheckout, setShowCheckout] = useState(false);

  // Add state for checkout data
  const [checkoutData, setCheckoutData] = useState(null);

  // Add this function to handle checkout navigation
  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0 && selectedReturnItems.length === 0) {
      return;
    }
    
    // Find station details using the same pattern as searchJourneyTrains
    const fromStation = stations.find(s => (s.id || s.stationID) === parseInt(formData.from));
    const toStation = stations.find(s => (s.id || s.stationID) === parseInt(formData.to));
    
    if (!fromStation || !toStation) {
      console.error('Station not found:', { from: formData.from, to: formData.to });
      return;
    }

    // Get station names using the same pattern
    const fromStationName = fromStation.stationName || fromStation.name;
    const toStationName = toStation.stationName || toStation.name;
    const modifiedCoach = {
      ...selectedCoach,
      name: `#${selectedCoach.coachID} - ${selectedCoach.name}`
    };
    const modifiedReturnCoach = selectedReturnCoach ? {
      ...selectedReturnCoach,
      name: `#${selectedReturnCoach.coachID} - ${selectedReturnCoach.name}`
    } : null;
    const checkoutData = {
      train: selectedTrain,
      coach: modifiedCoach,
      from: formData.from,
      to: formData.to,
      fromName: fromStationName,
      toName: toStationName,
      departureDate: formData.departureDate,
      tripType: formData.tripType,
      selectedItems: selectedItems,
      totalPrice: calculateTotalPrice(),
      distance: calculateDistance(parseInt(formData.from), parseInt(formData.to))
    };

    if (formData.tripType === 'round-trip') {
      checkoutData.returnTrain = selectedReturnTrain;
      checkoutData.returnCoach = modifiedReturnCoach;
      checkoutData.returnDate = formData.returnDate;
      checkoutData.returnItems = selectedReturnItems;
    }

    // Debug log to verify data
    console.log('Checkout Data:', {
      ...checkoutData,
      fromStation: fromStationName,
      toStation: toStationName
    });

    // Store checkout data in localStorage
    localStorage.setItem('checkoutData', JSON.stringify(checkoutData));

    // Navigate to checkout page
    navigate('/checkout');
  };

  // Add handler for returning from checkout
  const handleBackFromCheckout = () => {
    setShowCheckout(false);
  };

  // Add handler for completing checkout
  const handleCheckoutComplete = (bookingResult) => {
    // Handle successful booking
    console.log('Booking completed:', bookingResult);
    // You can redirect to a confirmation page or show a success message
  };

  return (
    <>
      {showCheckout ? (
        <Checkout
          bookingData={checkoutData}
          onBack={handleBackFromCheckout}
          onComplete={handleCheckoutComplete}
        />
      ) : (
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
                {loadingCoaches ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading coaches...</p>
                  </div>
                ) : (
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                    {trainCoaches.map((coach, index) => (
                      <div
                        key={`${coach.coachID}-${index}`}
                        className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all ${
                          selectedCoach?.displayId === coach.displayId ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                        onClick={() => handleSelectCoach(coach)}
                      >
                        <h3 className="font-medium">Coach {coach.displayId}</h3>
                        <div className="text-sm text-gray-600">#{coach.coachID} - {coach.name}</div>
                        <div className="mt-2 font-semibold text-blue-600">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(coach.price)}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          {coach.type === 'seat' ? 'Seater' : 'Sleeper'} - {coach.capacity} seats
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Seat/Bed Selection */}
            {selectedCoach && (
              <div className="p-6 border-t border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Choose Your Seat</h2>
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="seat-selection-container">{renderSeatsOrBeds()}</div>
                </div>
              </div>
            )}

            {/* Return Journey Section */}
            {formData.tripType === 'round-trip' && showSearchResults && (
              <div className="p-6 border-t border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Return Journey</h2>
                {loadingReturnTrains ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Searching for return trains...</p>
                  </div>
                ) : returnTrains.length > 0 ? (
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {returnTrains.map(train => (
                      <div
                        key={train.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${selectedReturnTrain?.id === train.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                        onClick={() => handleSelectTrain(train, true)}
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
                              {train.journey && train.journey[formData.to] ?
                                new Date(train.journey[formData.to].date).toLocaleDateString('vi-VN')
                                : new Date(train.departureDate).toLocaleDateString('vi-VN')} - {' '}
                              {formData.to && stations.find(s =>
                                (s.id || s.stationID) === parseInt(formData.to)
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
                              {train.journey && train.journey[formData.from] ?
                                new Date(train.journey[formData.from].date).toLocaleDateString('vi-VN')
                                : new Date(train.arrivalDate).toLocaleDateString('vi-VN')} - {' '}
                              {formData.from && stations.find(s =>
                                (s.id || s.stationID) === parseInt(formData.from)
                              )?.stationName || 'Loading...'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-600">No return trains found</div>
                )}
              </div>
            )}

            {/* Return Coach Selection */}
            {selectedReturnTrain && formData.tripType === 'round-trip' && (
              <div className="p-6 border-t border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Select Return Coach</h2>
                {loadingCoaches ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading coaches...</p>
                  </div>
                ) : (
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                    {returnTrainCoaches.map((coach, index) => (
                      <div
                        key={`${coach.coachID}-${index}`}
                        className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all ${selectedReturnCoach?.coachID === coach.coachID ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                        onClick={() => handleSelectCoach(coach, true)}
                      >
                        <h3 className="font-medium">Coach {coach.displayId}</h3>
                        <div className="text-sm text-gray-600">#{coach.coachID} - {coach.name}</div>
                        <div className="mt-2 font-semibold text-blue-600">
                          {formatCurrency(coach.price)}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          {coach.type === 'seat' ? 'Seater' : 'Sleeper'} - {coach.capacity} seats
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          {renderSelectionPanel()}
          {/* Return Journey Seat/Bed Selection */}
          {selectedReturnCoach && formData.tripType === 'round-trip' && (
            <div className="p-6 border-t border-gray-200 bg-white shadow-lg"> {/* Added bg-white and shadow-lg */}
              <h2 className="text-xl font-semibold mb-4">Choose Your Return Seat</h2>
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="seat-selection-container">
                  {selectedReturnCoach.type === 'seat'
                    ? renderRegularCoach(selectedReturnCoach, true)
                    : renderSleeperCoach(selectedReturnCoach, true)}
                </div>
              </div>
            </div>
          )}

          {/* Combined Booking Information at the bottom */}
          {(selectedItems.length > 0 || selectedReturnItems.length > 0) && (
            <div className="p-6 border-t border-gray-200 bg-white shadow-lg mt-4">
              <h2 className="text-xl font-semibold mb-4">Booking Information</h2>

              {/* Group outbound items by coach */}
              {Array.from(new Set(selectedItems.map(item => item.coachId))).map(coachId => {
                const coach = trainCoaches.find(c => c.coachID === coachId);
                const itemsForCoach = selectedItems.filter(item => item.coachId === coachId);

                return coach && itemsForCoach.length > 0 && (
                  <div key={`outbound-${coachId}`} className="mb-6 p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Outbound Journey - Coach {coachId}</h3>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      <div>
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-700">Train Details</h4>
                          <p className="text-sm text-gray-600">Train Number: {selectedTrain.id}</p>
                          <p className="text-sm text-gray-600">Direction: {selectedTrain.direction}</p>
                          <p className="text-sm text-gray-600">
                            Route: {stations.find(s => (s.id || s.stationID) === parseInt(formData.from))?.stationName} →{' '}
                            {stations.find(s => (s.id || s.stationID) === parseInt(formData.to))?.stationName}
                          </p>
                        </div>
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-700">Schedule</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Departure</p>
                              <p className="text-sm text-gray-600">{new Date(selectedTrain.departureDate).toLocaleDateString('vi-VN')}</p>
                              <p className="text-sm font-medium">{formatTime(selectedTrain.startTime)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Arrival</p>
                              <p className="text-sm text-gray-600">{new Date(selectedTrain.arrivalDate).toLocaleDateString('vi-VN')}</p>
                              <p className="text-sm font-medium">{formatTime(selectedTrain.endTime)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-700">Coach & Seat Details</h4>
                          <p className="text-sm text-gray-600">Coach: #{coach.coachID} - {coach.name}</p>
                          <p className="text-sm text-gray-600">Type: {coach.type === 'seat' ? 'Seater Coach' : 'Sleeper Coach'}</p>
                          <p className="text-sm text-gray-600">Price per {coach.type}: {formatCurrency(coach.price)}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700">Selected {coach.type === 'seat' ? 'Seats' : 'Beds'}</h4>
                          <div className="mt-2 space-y-2">
                            {itemsForCoach.map(item => {
                              const itemNumber = item.col * coach.rows + item.row + 1;
                              return (
                                <div key={item.key} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                  <div>
                                    <span className="text-sm font-medium">
                                      {coach.type === 'seat' ? 'Seat' : 'Bed'} #{itemNumber}
                                    </span>
                                    <span className="text-xs text-gray-500 ml-2">
                                      (Row {item.row + 1}, Column {item.col + 1})
                                    </span>
                                  </div>
                                  <span className="text-sm text-blue-600">{formatCurrency(item.price)}</span>
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                Subtotal ({itemsForCoach.length} {coach.type}s)
                              </span>
                              <span className="font-medium">
                                {formatCurrency(itemsForCoach.reduce((sum, item) => sum + item.price, 0))}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Return Journey Information - Similar structure as outbound */}
              {Array.from(new Set(selectedReturnItems.map(item => item.coachId))).map(coachId => {
                const coach = returnTrainCoaches.find(c => c.coachID === coachId);
                const itemsForCoach = selectedReturnItems.filter(item => item.coachId === coachId);

                return coach && itemsForCoach.length > 0 && (
                  <div key={`return-${coachId}`} className="mb-6 p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Return Journey - Coach {coachId}</h3>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      <div>
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-700">Train Details</h4>
                          <p className="text-sm text-gray-600">Train Number: {selectedReturnTrain.id}</p>
                          <p className="text-sm text-gray-600">Direction: {selectedReturnTrain.direction}</p>
                          <p className="text-sm text-gray-600">
                            Route: {stations.find(s => (s.id || s.stationID) === parseInt(formData.to))?.stationName} →{' '}
                            {stations.find(s => (s.id || s.stationID) === parseInt(formData.from))?.stationName}
                          </p>
                        </div>
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-700">Schedule</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Departure</p>
                              <p className="text-sm text-gray-600">{new Date(selectedReturnTrain.departureDate).toLocaleDateString('vi-VN')}</p>
                              <p className="text-sm font-medium">{formatTime(selectedReturnTrain.startTime)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Arrival</p>
                              <p className="text-sm text-gray-600">{new Date(selectedReturnTrain.arrivalDate).toLocaleDateString('vi-VN')}</p>
                              <p className="text-sm font-medium">{formatTime(selectedReturnTrain.endTime)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-700">Coach & Seat Details</h4>
                          <p className="text-sm text-gray-600">Coach: #{coach.coachID} - {coach.name}</p>
                          <p className="text-sm text-gray-600">Type: {coach.type === 'seat' ? 'Seater Coach' : 'Sleeper Coach'}</p>
                          <p className="text-sm text-gray-600">Price per {coach.type}: {formatCurrency(coach.price)}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700">Selected {coach.type === 'seat' ? 'Seats' : 'Beds'}</h4>
                          <div className="mt-2 space-y-2">
                            {itemsForCoach.map(item => {
                              const itemNumber = item.col * coach.rows + item.row + 1;
                              return (
                                <div key={item.key} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                  <div>
                                    <span className="text-sm font-medium">
                                      {coach.type === 'seat' ? 'Seat' : 'Bed'} #{itemNumber}
                                    </span>
                                    <span className="text-xs text-gray-500 ml-2">
                                      (Row {item.row + 1}, Column {item.col + 1})
                                    </span>
                                  </div>
                                  <span className="text-sm text-blue-600">{formatCurrency(item.price)}</span>
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                Subtotal ({itemsForCoach.length} {coach.type}s)
                              </span>
                              <span className="font-medium">
                                {formatCurrency(itemsForCoach.reduce((sum, item) => sum + item.price, 0))}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Total Price and Continue Button */}
              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <div className="mb-4 sm:mb-0">
                  <p className="text-sm text-gray-600">
                    Total Tickets: {selectedItems.length + selectedReturnItems.length}
                  </p>
                  <p className="font-semibold text-lg">
                    Total Price: {formatCurrency(calculateTotalPrice())}
                    <span className="text-sm text-gray-500 ml-2">
                      {formData.tripType === 'round-trip' ? '(Round-trip)' : '(One-way)'}
                    </span>
                  </p>
                </div>
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}
          {/* {showCheckout && checkoutData && (
            <Checkout 
              data={checkoutData} 
              onBack={handleBackFromCheckout} 
              onComplete={handleCheckoutComplete}
            />
          )} */}
        </div>
      )}
    </>
  );
};

export default Buy_Ticket;