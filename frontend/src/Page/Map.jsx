import React from 'react';

const Map = ({ stations, fromStation, toStation }) => {
  // If no stations provided, render simple line
  if (!stations || stations.length === 0) {
    return (
      <div className="map-container">
        <div className="simple-map">
          <div className="station-marker start">Loading...</div>
        </div>
      </div>
    );
  }
  
  // Convert fromStation and toStation to numbers for comparison
  const fromStationId = parseInt(fromStation);
  const toStationId = parseInt(toStation);
  
  return (
    <div className="map-container">
      <div className="detailed-map">
        {stations.map((station, index) => (
          <React.Fragment key={station.id}>
            <div 
              className={`station-marker ${parseInt(station.id) === fromStationId ? 'start' : parseInt(station.id) === toStationId ? 'end' : ''}`}
            >
              <div className="station-dot"></div>
              <div className="station-name">{station.name}</div>
              {station.isEndpoint && (
                <div className="station-badge">
                  {parseInt(station.id) === fromStationId ? 'Departure' : 'Arrival'}
                </div>
              )}
            </div>
            {index < stations.length - 1 && <div className="map-line-segment"></div>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Map;