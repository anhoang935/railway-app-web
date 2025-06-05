import React from 'react';
import { Train, Clock, MapPin, AlertCircle } from 'lucide-react';

function LiveTrainTracking({ trains }) {
    if (!trains || !Array.isArray(trains)) {
        return (
            <div className="text-center py-8 text-gray-500">
                <Train size={40} className="mx-auto mb-2 opacity-50" />
                <p>Loading train data...</p>
            </div>
        );
    }

    if (trains.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <Train size={40} className="mx-auto mb-2 opacity-50" />
                <p>No active trains found</p>
            </div>
        );
    }

    const statusConfig = {
        'on-time': { color: 'text-green-600 bg-green-100', label: 'On Time', icon: Train },
        'scheduled': { color: 'text-green-600 bg-green-100', label: 'Scheduled', icon: Train },
        'delayed': { color: 'text-yellow-600 bg-yellow-100', label: 'Delayed', icon: AlertCircle },
        'cancelled': { color: 'text-red-600 bg-red-100', label: 'Cancelled', icon: AlertCircle },
        'in-transit': { color: 'text-blue-600 bg-blue-100', label: 'In Transit', icon: Train },
        'completed': { color: 'text-gray-600 bg-gray-100', label: 'Completed', icon: Train },
        default: { color: 'text-gray-600 bg-gray-100', label: 'Idle', icon: Train }
    };

    const getStatusData = (status) => statusConfig[status] || statusConfig.default;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Live Train Tracking</h4>
                <div className="flex items-center text-xs text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    Live
                </div>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
                {trains.map(train => {
                    const statusData = getStatusData(train.status);
                    const StatusIcon = statusData.icon;

                    return (
                        <div key={train.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                    <div className="p-1.5 bg-blue-100 rounded-full mr-2">
                                        <Train size={14} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{train.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {train.type} • Capacity: {train.capacity}
                                        </p>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${statusData.color}`}>
                                    <StatusIcon size={14} />
                                    <span className="ml-1">{statusData.label}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                                <div className="flex items-center text-gray-600">
                                    <MapPin size={12} className="mr-1" />
                                    <span className="truncate">{train.currentStation}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <Clock size={12} className="mr-1" />
                                    <span>{train.nextArrival}</span>
                                </div>
                            </div>

                            {train.status === 'in-transit' && (
                                <div className="mt-2">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span className="truncate">{train.origin}</span>
                                        <span>{train.progress}%</span>
                                        <span className="truncate">{train.destination}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div
                                            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                            style={{ width: `${train.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default LiveTrainTracking;