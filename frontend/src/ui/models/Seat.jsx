import React, {useState} from 'react'

const Seat = ({seatNumber, price, isBooked, isSelected, isHovered, onMouseEnter, onMouseLeave, isReversed}) => {
  const getSeatColor = () => {
    if(isBooked) return 'bg-orange-500'
    if(isSelected) return 'bg-green-500'

    return 'bg-[--primary-color]'
  }
  
  return (
    <div
      className="flex justify-center items-center m-0.5 sm:m-1 relative cursor-pointer"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative flex items-center">
        {isReversed ? (
          <>
            <div className={`w-5 h-5 sm:w-8 sm:h-8 rounded-l-md rounded-r-xl
                ${getSeatColor()} 
                flex items-center justify-center text-white font-bold text-[9px] sm:text-sm shadow-md`}>
              <div className="mr-[0.15rem] sm:mr-[0.35rem]">{seatNumber}</div>
            </div>
            <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-0.5 sm:w-1.5 h-6 sm:h-9 bg-yellow-700 rounded-l-sm`}></div>
            <div className="absolute w-[1px] sm:w-1 h-2.5 sm:h-4 right-[0.12rem] sm:right-[0.35rem] top-1.5 sm:top-2 rounded-l-[25%] bg-slate-100 shadow-sm sm:shadow-lg"></div>
            <div>
              <div className={`absolute top-0 w-2.5 sm:w-4 h-[1px] sm:h-1 right-[0.3rem] sm:right-[0.68rem] ${isSelected ? 'bg-green-800': 'bg-blue-800'} rounded-sm sm:rounded-md shadow-sm`}></div>
              <div className={`absolute bottom-0 w-2.5 sm:w-4 h-[1px] sm:h-1 right-[0.3rem] sm:right-[0.68rem] ${isSelected ? 'bg-green-800': 'bg-blue-800'} rounded-sm sm:rounded-md shadow-sm`}></div>
            </div>
          </>
        ) : (
          <>
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 sm:w-1.5 h-6 sm:h-9 bg-yellow-700 rounded-r-sm`}></div>
            <div className="absolute w-[1px] sm:w-1 h-2.5 sm:h-4 left-[0.12rem] sm:left-[0.35rem] top-1.5 sm:top-2 rounded-r-[25%] bg-slate-100 shadow-sm sm:shadow-lg"></div>
            <div className={`w-5 h-5 sm:w-8 sm:h-8 rounded-l-xl rounded-r-md 
                          ${getSeatColor()} 
                          flex items-center justify-center text-white font-bold text-[9px] sm:text-sm shadow-md`}>
              <div className="ml-[0.15rem] sm:ml-[0.35rem]">{seatNumber}</div>
            </div>
            <div>
              <div className={`absolute top-0 w-2.5 sm:w-4 h-[1px] sm:h-1 right-[0.3rem] sm:right-[0.68rem] ${isSelected ? 'bg-green-800': 'bg-blue-800'} rounded-sm sm:rounded-md shadow-sm`}></div>
              <div className={`absolute bottom-0 w-2.5 sm:w-4 h-[1px] sm:h-1 right-[0.3rem] sm:right-[0.68rem] ${isSelected ? 'bg-green-800': 'bg-blue-800'} rounded-sm sm:rounded-md shadow-sm`}></div>
            </div>
          </>
        )}
      </div>
      {isHovered && (
        <div className="absolute -left-20 sm:-left-36 -top-1 sm:top-0 bg-white p-1 sm:p-2 rounded shadow-lg z-10 whitespace-nowrap text-[10px] sm:text-sm min-w-max">
          <p className="mb-0.5 sm:mb-1">
            {isBooked ? "Not available" : "Available"}
          </p>
          <p>Price: {isBooked ? "Sold" : price || "N/A"}</p>
        </div>
      )}
    </div>
  )
}

export default Seat