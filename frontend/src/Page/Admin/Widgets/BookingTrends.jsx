import React, { useState, useEffect, useRef } from 'react';
import { Ticket, TrendingUp, Calendar, Users, MapPin } from 'lucide-react';

function BookingTrends({ bookingData, timeFilter = 'today' }) {
    const [showScrollbar, setShowScrollbar] = useState(false);
    const scrollContainerRef = useRef(null);
    const scrollTimeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    if (!bookingData) {
        return (
            <div className="text-center py-4 text-gray-500">
                <div className="animate-pulse">Loading booking trends data...</div>
            </div>
        );
    }

    const { totalBookings, completionRate, popularRoutes, timeDistribution, cancellationRate } = bookingData;

    const getCompletionColor = (rate) => {
        if (rate >= 90) return 'text-green-600 bg-green-100';
        if (rate >= 75) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const handleScroll = () => {
        setShowScrollbar(true);
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
            setShowScrollbar(false);
        }, 1000);
    };

    const handleMouseEnter = () => {
        if (scrollContainerRef.current) {
            const { scrollHeight, clientHeight } = scrollContainerRef.current;
            if (scrollHeight > clientHeight) {
                setShowScrollbar(true);
            }
        }
    };

    const handleMouseLeave = () => {
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
            setShowScrollbar(false);
        }, 300);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-sm">Booking Trends</h4>
                <button className="text-xs text-blue-600 hover:text-blue-800">View Analytics</button>
            </div>

            <div
                ref={scrollContainerRef}
                className={`flex-1 space-y-2 overflow-y-auto transition-all duration-300 booking-trends-scrollbar ${showScrollbar ? 'scrollbar-visible' : 'scrollbar-hide'
                    }`}
                onScroll={handleScroll}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-purple-50 rounded border border-purple-200">
                        <div className="flex items-center mb-1">
                            <Ticket size={12} className="text-purple-600 mr-1" />
                            <span className="text-xs font-medium text-purple-700">Total Bookings</span>
                        </div>
                        <p className="text-lg font-bold text-purple-800">{totalBookings.toLocaleString()}</p>
                        <p className="text-xs text-purple-600">
                            {timeFilter === 'today' ? 'Today' :
                                timeFilter === 'week' ? 'This Week' : 'This Month'}
                        </p>
                    </div>

                    <div className="p-2 bg-green-50 rounded border border-green-200">
                        <div className="flex items-center mb-1">
                            <TrendingUp size={12} className="text-green-600 mr-1" />
                            <span className="text-xs font-medium text-green-700">Success Rate</span>
                        </div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-bold ${getCompletionColor(completionRate)}`}>
                            {completionRate}%
                        </div>
                        <p className="text-xs text-green-600 mt-1">Completed bookings</p>
                    </div>
                </div>

                <div>
                    <p className="text-xs font-medium text-gray-700 mb-2">Popular Routes</p>
                    {popularRoutes.length > 0 ? (
                        <div className="space-y-1">
                            {popularRoutes.slice(0, 2).map((route, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                                    <div className="flex items-center">
                                        <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                                            <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin size={10} className="text-gray-500 mr-1" />
                                            <span className="text-xs font-medium truncate max-w-24">
                                                {route.from} → {route.to}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-800">{route.bookings}</p>
                                        <p className="text-xs text-gray-500">{route.percentage}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-3 bg-gray-50 rounded text-center">
                            <p className="text-xs text-gray-500">No route data available</p>
                            <p className="text-xs text-gray-400">Popular routes will appear here</p>
                        </div>
                    )}
                </div>

                <div>
                    <p className="text-xs font-medium text-gray-700 mb-2">Booking Activity</p>
                    {timeDistribution.length > 0 ? (
                        <div className="grid grid-cols-2 gap-1">
                            {timeDistribution.slice(0, 4).map((period, index) => (
                                <div key={index} className="flex items-center justify-between p-1 bg-gray-50 rounded">
                                    <div className="flex items-center">
                                        <Calendar size={10} className="text-gray-600 mr-1" />
                                        <span className="text-xs text-gray-700">{period.period.substring(0, 3)}</span>
                                    </div>
                                    <span className="text-xs font-medium text-gray-800">{period.count}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-1">
                            {['Morning', 'Afternoon', 'Evening', 'Night'].map((period, index) => (
                                <div key={index} className="flex items-center justify-between p-1 bg-gray-50 rounded">
                                    <span className="text-xs text-gray-700">{period.substring(0, 3)}</span>
                                    <span className="text-xs text-gray-400">0</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <p className="text-xs font-medium text-gray-700 mb-2">Booking Trends</p>
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded border border-blue-200">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-blue-700">Daily Growth</span>
                            <span className="text-xs font-bold text-blue-800">+12%</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-1">
                            <div className="bg-blue-600 h-1 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-center">
                        <Users size={12} className="text-red-600 mr-1" />
                        <span className="text-xs font-medium text-red-700">Cancellation Rate</span>
                    </div>
                    <span className="text-sm font-bold text-red-800">{cancellationRate}%</span>
                </div>
            </div>
        </div>
    );
}

export default BookingTrends;