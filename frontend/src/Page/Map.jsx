import React from 'react';

const Map = ({ stations, fromStation, toStation }) => {
  // If no stations provided, render simple line
  if (!stations || stations.length === 0) {
    return (
      <div className="map-container">
        <div className="simple-map">
          <div className="station-marker loading">Loading...</div>
        </div>
      </div>
    );
  }
  
  // Convert fromStation and toStation to numbers for comparison
  const fromStationId = parseInt(fromStation);
  const toStationId = parseInt(toStation);
  
  // Find indices of departure and arrival stations
  const departureIndex = stations.findIndex(s => parseInt(s.id) === fromStationId);
  const arrivalIndex = stations.findIndex(s => parseInt(s.id) === toStationId);
  
  // Determine direction - true if departure is before arrival
  const isForwardDirection = departureIndex < arrivalIndex;
  
  return (
    <div className="map-container">
      <div className="detailed-map">
        {stations.map((station, index) => {
          const stationId = parseInt(station.id);
          const isDeparture = stationId === fromStationId;
          const isArrival = stationId === toStationId;
          
          // Determine if this station is between departure and arrival stations
          const isInRoute = (isForwardDirection && 
                            index >= departureIndex && 
                            index <= arrivalIndex) ||
                           (!isForwardDirection && 
                            index >= arrivalIndex && 
                            index <= departureIndex);
          
          // Set classes based on station type - keeping all stations the same size
          let stationClassName = "station-marker";
          if (isDeparture) stationClassName += " departure";
          if (isArrival) stationClassName += " arrival";
          if (isInRoute && !isDeparture && !isArrival) stationClassName += " in-route";
          
          return (
            <div key={station.id} className="station-wrapper">
              <div className={stationClassName}>
                <div className="station-dot"></div>
                <div className="station-name">{station.name}</div>
              </div>
              
              {/* Add connecting line after each station except the last one */}
              {index < stations.length - 1 && (
                <div className={`connecting-line ${isInRoute && index >= Math.min(departureIndex, arrivalIndex) && index < Math.max(departureIndex, arrivalIndex) ? 'active-route' : ''}`}>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Map;