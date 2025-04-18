import React from 'react';
import '../styles/map.css';

export const Map = ({ stations, fromStation, toStation }) => {
  // Metro map constants - these become the viewBox dimensions
  const width = 600;
  const height = 800;
  const stationRadius = 8;
  const lineWidth = 6;
  
  // Sample data from Vietnam's North-South railway
  const railwayStations = [
    { name: "Ha Noi", x: 300, y: 100 },
    { name: "Nam Dinh", x: 320, y: 180 },
    { name: "Thanh Hoa", x: 340, y: 260 },
    { name: "Vinh", x: 360, y: 340 },
    { name: "Da Nang", x: 280, y: 500 },
    { name: "Nha Trang", x: 350, y: 650 },
    { name: "Ho Chi Minh City", x: 320, y: 750 }
  ];

  // Generate path for the railway line
  const generateLinePath = () => {
    return railwayStations.map((station, index) => 
      (index === 0 ? `M ${station.x},${station.y}` : `L ${station.x},${station.y}`)
    ).join(' ');
  };

  // Check if a station is selected
  const isStationSelected = (stationName) => {
    return stationName === fromStation || stationName === toStation;
  };

  return (
    <div className="metro-map">
      <div className="svg-container">
        <svg 
          className="responsive-svg"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Railway Line */}
          <path 
            d={generateLinePath()} 
            stroke="#0066cc" 
            strokeWidth={lineWidth} 
            fill="none" 
            strokeLinecap="round"
          />
          
          {/* Stations */}
          {railwayStations.map((station, index) => (
            <React.Fragment key={station.name}>
              {/* Station Circle */}
              <circle 
                cx={station.x} 
                cy={station.y} 
                r={stationRadius}
                className={`station-circle ${isStationSelected(station.name) ? 'selected-station' : ''}`}
                fill={isStationSelected(station.name) ? '#ff6600' : 'white'}
                stroke="#0066cc"
                strokeWidth="3"
              />
              
              {/* Station Label */}
              <text 
                x={station.x + (index % 2 === 0 ? -15 : 15)} 
                y={station.y - 15}
                textAnchor={index % 2 === 0 ? 'end' : 'start'}
                className={`station-name ${isStationSelected(station.name) ? 'selected-station-text' : ''}`}
                fontSize="12"
              >
                {station.name}
              </text>
            </React.Fragment>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default Map;