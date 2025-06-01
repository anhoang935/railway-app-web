import React, { useState, useEffect } from 'react'

const Seat = ({seatNumber, price, isBooked, isSelected, isHovered, onMouseEnter, onMouseLeave, isReversed}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const getSeatColor = () => {
    if(isBooked) return 'bg-orange-500'
    if(isSelected) return 'bg-green-500'

    return 'bg-[--primary-color]'
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div
      className={`relative m-1 inline-block rounded-md cursor-pointer transition-all ${
        isMobile ? 'transform rotate-90' : ''
      } ${isHovered ? 'z-50' : 'z-10'}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative flex items-center">
        {isReversed ? (
          <>
            <div className={`w-8 h-8 rounded-l-md rounded-r-xl
                ${getSeatColor()} 
                flex items-center justify-center text-white font-bold text-sm shadow-md`}>
              <div className={`mr-[0.35rem] ${isMobile ? 'transform -rotate-90' : ''}`}>{seatNumber}</div>
            </div>
            <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-yellow-700 rounded-l-sm`}></div>
            <div className="absolute w-1 h-4 right-[0.35rem] top-2 rounded-l-[25%] bg-slate-100 shadow-lg"></div>
            <div>
              <div className={`absolute top-0 w-4 h-1 right-[0.68rem] ${isSelected ? 'bg-green-800': 'bg-blue-800'} rounded-md shadow-sm`}></div>
              <div className={`absolute bottom-0 w-4 h-1 right-[0.68rem] ${isSelected ? 'bg-green-800': 'bg-blue-800'} rounded-md shadow-sm`}></div>
            </div>
          </>
        ) : (
          <>
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-yellow-700 rounded-r-sm`}></div>
            <div className="absolute w-1 h-4 left-[0.35rem] top-2 rounded-r-[25%] bg-slate-100 shadow-lg"></div>
            <div className={`w-8 h-8 rounded-l-xl rounded-r-md 
                          ${getSeatColor()} 
                          flex items-center justify-center text-white font-bold text-sm shadow-md`}>
              <div className={`ml-[0.35rem] ${isMobile ? 'transform -rotate-90' : ''}`}>{seatNumber}</div>
            </div>
            <div>
              <div className={`absolute top-0 w-4 h-1 right-[0.34rem] ${isSelected ? 'bg-green-800': 'bg-blue-800'} rounded-md shadow-sm`}></div>
              <div className={`absolute bottom-0 w-4 h-1 right-[0.34rem] ${isSelected ? 'bg-green-800': 'bg-blue-800'} rounded-md shadow-sm`}></div>
            </div>
          </>
        )}
      </div>
      {isHovered && (
        <div className={`absolute bg-white p-2 rounded-md shadow-lg z-10 whitespace-nowrap ${
          isMobile ? 'transform -rotate-90 -left-20 -top-16' : '-left-36 top-0'
        }`}>
          <p className="text-sm">
            {isBooked ? "Not available" : "Available"}
          </p>
          <p className="text-sm">Price: {isBooked ? "Ticket sold" : price || "N/A"}</p>
        </div>
      )}
    </div>
  )
}

export default Seat