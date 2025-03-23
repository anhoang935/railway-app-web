import React from 'react'

const Bed = ({bedNumber, price, isBooked, isSelected, isHovered, onMouseEnter, onMouseLeave }) => {
    const getSeatColor = () => {
        if(isBooked) return 'bg-orange-500'
        if(isSelected) return 'bg-green-500'
    
        return 'bg-[--primary-color]'
    }
    return (
        <div
        className={`relative mx-1 inline-block rounded-md cursor-pointer transition-all`}
        onMouseEnter = {onMouseEnter}
        onMouseLeave = {onMouseLeave}
        >
            {/* Bed */}
            <div className="relative">
                <div 
                className={`w-8 h-8 rounded-md 
                        ${getSeatColor()} 
                        flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                    <div className="mb-2">{bedNumber}</div>
                </div>
                {/* Pillow :P */}
                <div className=" absolute w-4 h-2 left-2 top-5 rounded-sm bg-white shadow-sm"></div>

                {/* Blanket */}
                <div className="absolute bottom-1 left-1 w-6 h-1.5 bg-gray-100 rounded-sm">
                    <div className="absolute bottom-0.5 left-0.5 right-0.5 h-px bg-gray-300"></div>
                </div>

                {/* Khung giường, sorry ko bit how to write it in english :c, nvm it's bed frame*/}
                <div>
                    <div className={`absolute left-0 top-0 w-1 h-8 ${isSelected ? 'bg-green-800': 'bg-blue-800'} rounded-tl-md`}></div>
                    <div className={`absolute bottom-0 w-8 h-1 ${isSelected ? 'bg-green-800': 'bg-blue-800'} rounded-b-md`}></div>
                    <div className={`absolute right-0 top-0 w-1 h-8 ${isSelected ? 'bg-green-800': 'bg-blue-800'} rounded-tr-md`}></div>
                </div>
            </div>

            {isHovered && (
                <div className="absolute -left-36 top-0 bg-white p-2 rounded-md shadow-lg z-10 whitespace-nowrap">
                    <p className="text-sm">
                    {isBooked ? "Not available seat" : "Available seat"}
                    </p>
                    <p className="text-sm">Price: {isBooked ? "Ticket sold" : price || "N/A"}</p>
                </div>
            )}
        </div>
    )
}

export default Bed