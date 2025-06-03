import React from 'react';
import { TrendingUp } from 'lucide-react';

function StationTraffic({ stations, timeFilter = 'today' }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Top Stations by Traffic</h4>
                {/* Filter & Sort button removed */}
            </div>

            <div className="space-y-4">
                {stations.map(station => (
                    <div key={station.id} className="relative pt-1">
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-sm font-medium">{station.name}</p>
                            <div className="flex items-center">
                                <TrendingUp size={14} className="text-green-500 mr-1" />
                                <span className="text-sm font-medium">{station.passengers.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-1 flex rounded bg-gray-200">
                            <div
                                className="bg-blue-500"
                                style={{ width: `${(station.passengers / 15000) * 100}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>{station.trains} trains {timeFilter === 'today' ? 'today' :
                                timeFilter === 'week' ? 'this week' : 'this month'}</span>
                            <span>Updated 5m ago</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default StationTraffic;