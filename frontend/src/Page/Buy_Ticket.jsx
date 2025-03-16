import React, { useState } from 'react';
import { Sofa, Armchair, BedSingle, BedDouble, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Coach types
const COACH_TYPES = {
  DOUBLE_SEAT: 'DOUBLE_SEAT',
  SINGLE_SEAT: 'SINGLE_SEAT',
  SINGLE_BED: 'SINGLE_BED',
  DOUBLE_BED: 'DOUBLE_BED',
};

// Sample data for coaches
const coachesData = [
  {
    id: 'A1',
    type: COACH_TYPES.DOUBLE_SEAT,
    seats: Array(40).fill().map((_, i) => ({
      id: `A1-${i + 1}`,
      isBooked: Math.random() > 0.7,
    })),
  },
  {
    id: 'B1',
    type: COACH_TYPES.SINGLE_SEAT,
    seats: Array(48).fill().map((_, i) => ({
      id: `B1-${i + 1}`,
      isBooked: Math.random() > 0.7,
    })),
  },
  {
    id: 'S1',
    type: COACH_TYPES.SINGLE_BED,
    seats: Array(30).fill().map((_, i) => ({
      id: `S1-${i + 1}`,
      isBooked: Math.random() > 0.7,
    })),
  },
  {
    id: 'D1',
    type: COACH_TYPES.DOUBLE_BED,
    seats: Array(20).fill().map((_, i) => ({
      id: `D1-${i + 1}`,
      isBooked: Math.random() > 0.7,
    })),
  },
];

const Buy_Ticket = () => {
  const [currentCoachIndex, setCurrentCoachIndex] = useState(0);
  const [selectedSeat, setSelectedSeat] = useState(null);
  
  const currentCoach = coachesData[currentCoachIndex];
  
  const handlePrevCoach = () => {
    setCurrentCoachIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };
  
  const handleNextCoach = () => {
    setCurrentCoachIndex((prev) => (prev < coachesData.length - 1 ? prev + 1 : prev));
  };
  
  const handleCoachSelect = (index) => {
    setCurrentCoachIndex(index);
  };
  
  const handleSeatSelect = (seatId) => {
    setSelectedSeat(seatId);
  };
  
  const renderSeatIcon = (seat, type) => {
    const isSelected = selectedSeat === seat.id;
    const color = seat.isBooked ? '#ff3b30' : isSelected ? '#1e32c5' : '#4cd964';
    const size = 24;
    const props = { size, color, onClick: seat.isBooked ? null : () => handleSeatSelect(seat.id) };
    
    switch (type) {
      case COACH_TYPES.DOUBLE_SEAT:
        return <Sofa {...props} />;
      case COACH_TYPES.SINGLE_SEAT:
        return <Armchair {...props} />;
      case COACH_TYPES.SINGLE_BED:
        return <BedSingle {...props} />;
      case COACH_TYPES.DOUBLE_BED:
        return <BedDouble {...props} />;
      default:
        return <Armchair {...props} />;
    }
  };
  
  const getCoachTypeLabel = (type) => {
    switch (type) {
      case COACH_TYPES.DOUBLE_SEAT:
        return 'Double Seat';
      case COACH_TYPES.SINGLE_SEAT:
        return 'Single Seat';
      case COACH_TYPES.SINGLE_BED:
        return 'Single Bed';
      case COACH_TYPES.DOUBLE_BED:
        return 'Double Bed';
      default:
        return 'Unknown';
    }
  };
  
  return (
    <div className="train-booking-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      {/* Coach selector */}
      <div className="coach-selector" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', gap: '10px' }}>
        {coachesData.map((coach, index) => (
          <motion.div
            key={coach.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCoachSelect(index)}
            style={{
              padding: '10px 15px',
              borderRadius: '8px',
              backgroundColor: currentCoachIndex === index ? '#009cff' : '#f0f0f0',
              color: currentCoachIndex === index ? 'white' : '#333',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: currentCoachIndex === index ? '0 4px 8px rgba(0, 156, 255, 0.3)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {coach.id}
          </motion.div>
        ))}
      </div>
      
      {/* Coach info */}
      <div className="coach-info" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <div>
          <h2 style={{ margin: 0, color: '#1e32c5' }}>Coach {currentCoach.id}</h2>
          <p style={{ margin: '5px 0 0', color: '#666' }}>{getCoachTypeLabel(currentCoach.type)}</p>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#4cd964', borderRadius: '50%' }}></div>
            <span>Available</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#ff3b30', borderRadius: '50%' }}></div>
            <span>Booked</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#1e32c5', borderRadius: '50%' }}></div>
            <span>Selected</span>
          </div>
        </div>
      </div>
      
      {/* Coach layout */}
      <div className="coach-layout-container" style={{ position: 'relative', marginBottom: '30px' }}>
        <button 
          onClick={handlePrevCoach} 
          disabled={currentCoachIndex === 0}
          style={{
            position: 'absolute',
            left: '-20px',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: currentCoachIndex === 0 ? '#e0e0e0' : '#009cff',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: currentCoachIndex === 0 ? 'not-allowed' : 'pointer',
            zIndex: 2,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          }}
        >
          <ChevronLeft size={24} />
        </button>
        
        <motion.div 
          key={currentCoach.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="coach-layout"
          style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
            border: '2px solid #eaeaea',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div className="coach-shape" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '8px',
            backgroundColor: '#009cff',
            borderTopLeftRadius: '13px',
            borderTopRightRadius: '13px',
          }}></div>
          
          <div className="coach-windows" style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '15px',
          }}>
            <div style={{ color: '#1e32c5', fontWeight: 'bold' }}>Left Window Side</div>
            <div style={{ color: '#1e32c5', fontWeight: 'bold' }}>Right Window Side</div>
          </div>
          
          <div className="seats-container" style={{
            display: 'grid',
            gridTemplateColumns: currentCoach.type === COACH_TYPES.SINGLE_SEAT ? 'repeat(12, 1fr)' : 
                               currentCoach.type === COACH_TYPES.DOUBLE_SEAT ? 'repeat(10, 1fr)' :
                               currentCoach.type === COACH_TYPES.SINGLE_BED ? 'repeat(10, 1fr)' : 'repeat(5, 1fr)',
            gap: '10px',
            padding: '10px',
          }}>
            {currentCoach.seats.map((seat) => (
              <div 
                key={seat.id} 
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: seat.isBooked ? 'not-allowed' : 'pointer',
                  opacity: seat.isBooked ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                {renderSeatIcon(seat, currentCoach.type)}
                <span style={{ 
                  fontSize: '10px', 
                  position: 'absolute', 
                  marginTop: '25px',
                  color: seat.isBooked ? '#999' : '#333'
                }}>
                  {seat.id.split('-')[1]}
                </span>
              </div>
            ))}
          </div>
          
          <div className="aisle" style={{
            height: '8px',
            backgroundColor: '#f0f0f0',
            margin: '15px 0',
            borderRadius: '4px',
          }}></div>
        </motion.div>
        
        <button 
          onClick={handleNextCoach} 
          disabled={currentCoachIndex === coachesData.length - 1}
          style={{
            position: 'absolute',
            right: '-20px',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: currentCoachIndex === coachesData.length - 1 ? '#e0e0e0' : '#009cff',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: currentCoachIndex === coachesData.length - 1 ? 'not-allowed' : 'pointer',
            zIndex: 2,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          }}
        >
          <ChevronRight size={24} />
        </button>
      </div>
      
      {/* Selected seat info */}
      {selectedSeat && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '10px',
          marginTop: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h3 style={{ margin: 0, color: '#1e32c5' }}>Selected Seat: {selectedSeat}</h3>
            <p style={{ margin: '5px 0 0', color: '#666' }}>Coach: {currentCoach.id} ({getCoachTypeLabel(currentCoach.type)})</p>
          </div>
          <button style={{
            backgroundColor: '#009cff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0, 156, 255, 0.3)',
          }}>
            Confirm Selection
          </button>
        </div>
      )}
    </div>
  );
};

export default Buy_Ticket;