import React from 'react';
import { Users, ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';

function PassengerFlow({ passengerData, timeFilter = 'today' }) {
    if (!passengerData) {
        return (
            <div className="text-center py-8 text-gray-500">
                <div className="animate-pulse">Loading passenger flow data...</div>
            </div>
        );
    }

    const { current, peak, average, hourlyFlow, trends } = passengerData;

    const getFlowColor = (percentage) => {
        if (percentage > 80) return 'bg-red-500';
        if (percentage > 60) return 'bg-yellow-500';
        if (percentage > 30) return 'bg-blue-500';
        return 'bg-green-500';
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Passenger Flow</h4>
                <div className="text-xs text-gray-500 flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse"></div>
                    Real-time
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { icon: Users, value: current, label: 'Active', color: 'blue' },
                        { icon: TrendingUp, value: peak, label: 'Peak Hour', color: 'orange' },
                        { icon: Users, value: average, label: 'Average', color: 'gray' }
                    ].map(({ icon: Icon, value, label, color }, index) => (
                        <div key={index} className={`text-center p-3 bg-${color}-50 rounded-lg`}>
                            <div className="flex items-center justify-center mb-1">
                                <Icon size={16} className={`text-${color}-600`} />
                            </div>
                            <p className={`text-lg font-bold text-${color}-800`}>{value.toLocaleString()}</p>
                            <p className={`text-xs text-${color}-600`}>{label}</p>
                        </div>
                    ))}
                </div>

                {hourlyFlow.length > 0 && (
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                            Hourly Flow (Last 12 Hours)
                        </p>
                        <div className="flex items-end space-x-1 h-16">
                            {hourlyFlow.map((flow, index) => (
                                <div key={index} className="flex-1 flex flex-col items-center">
                                    <div
                                        className={`w-full rounded-t ${getFlowColor(flow.percentage)} opacity-80`}
                                        style={{ height: `${Math.max(5, flow.percentage)}%` }}
                                        title={`${flow.hour}:00 - ${flow.count} passengers`}
                                    ></div>
                                    <span className="text-xs text-gray-500 mt-1">{flow.hour}h</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {trends.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Station Activity</p>
                        {trends.map((trend, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center">
                                    {trend.direction === 'up' ? (
                                        <ArrowUp size={14} className="text-green-500 mr-2" />
                                    ) : (
                                        <ArrowDown size={14} className="text-red-500 mr-2" />
                                    )}
                                    <span className="text-sm truncate">{trend.station}</span>
                                </div>
                                <div className="text-right">
                                    <span className={`text-sm font-medium ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {trend.change > 0 ? '+' : ''}{trend.change}
                                    </span>
                                    <p className="text-xs text-gray-500">{trend.passengers} total</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PassengerFlow;