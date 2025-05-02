import React from 'react';
import SystemAlerts from '../Widgets/SystemAlerts';
import TrainStatus from '../Widgets/TrainStatus';
import Maintenance from '../Widgets/Maintenance';
import StationTraffic from '../Widgets/StationTraffic';
import {
    AlertTriangle, Train, MapPin, Calendar, Search, Bell,
    RefreshCw, Filter, Clock, ChevronDown, X
} from 'lucide-react';

const Dashboard = ({
    formattedDateTime,
    dashboardLayout,
    isEditing,
    toggleWidgetVisibility,
    recentAlerts,
    trainStats,
    stationTraffic,
    upcomingMaintenance
}) => {
    const sortedWidgets = [...dashboardLayout].sort((a, b) => a.order - b.order);

    return (
        <>
            <header className="bg-white shadow-sm z-10">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center">
                        <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
                        <span className="ml-3 text-sm text-gray-500">{formattedDateTime}</span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-9 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                        </div>

                        <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                            <Bell size={20} className="text-gray-600" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        <button className="flex items-center text-gray-700 hover:text-blue-600">
                            <RefreshCw size={18} className="mr-1" />
                            <span className="text-sm">Refresh</span>
                        </button>
                    </div>
                </div>

                <div className="px-4 py-2 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                    <div className="flex items-center space-x-2">
                        <button className="flex items-center px-3 py-1 bg-white rounded-lg border border-gray-300 text-sm">
                            <Filter size={14} className="mr-1" />
                            <span>Filter</span>
                        </button>

                        <button className="flex items-center px-3 py-1 bg-white rounded-lg border border-gray-300 text-sm">
                            <Clock size={14} className="mr-1" />
                            <span>Today</span>
                            <ChevronDown size={14} className="ml-1" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 bg-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 animate-fadeInUp">
                    {sortedWidgets.map(widget => {
                        if (!widget.visible) return null;

                        return (
                            <div
                                key={widget.id}
                                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
                            >
                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                                    <h3 className="font-bold text-blue-600 flex items-center gap-2">
                                        {widget.id === 'alerts' && <AlertTriangle size={16} />}
                                        {widget.id === 'trains' && <Train size={16} />}
                                        {widget.id === 'stations' && <MapPin size={16} />}
                                        {widget.id === 'maintenance' && <Calendar size={16} />}
                                        {widget.title}
                                    </h3>
                                    {isEditing && (
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={() => toggleWidgetVisibility(widget.id)}
                                                className="p-1 hover:bg-gray-200 rounded"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6">
                                    {widget.id === 'alerts' && <SystemAlerts alerts={recentAlerts} />}
                                    {widget.id === 'trains' && <TrainStatus stats={trainStats} />}
                                    {widget.id === 'stations' && <StationTraffic stations={stationTraffic} />}
                                    {widget.id === 'maintenance' && <Maintenance maintenance={upcomingMaintenance} />}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </>
    );
};

export default Dashboard;