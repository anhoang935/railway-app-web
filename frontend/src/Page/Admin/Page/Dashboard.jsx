import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Search, X, Filter, Bell, RefreshCw, ChevronDown, Clock, Train, MapPin, Calendar,
    DollarSign, Activity, AlertTriangle, TrendingUp as TrendingUpIcon, Users as UsersIcon, AlertCircle
} from 'lucide-react';

import SystemAlerts from '../Widgets/SystemAlerts';
import TrainStatus from '../Widgets/TrainStatus';
import StationTraffic from '../Widgets/StationTraffic';
import Maintenance from '../Widgets/Maintenance';
import RevenueAnalytics from '../Widgets/RevenueAnalytics';
import LiveTrainTracking from '../Widgets/LiveTrainTracking';
import PassengerFlow from '../Widgets/PassengerFlow';
import SystemPerformance from '../Widgets/SystemPerformance';
import BookingTrends from '../Widgets/BookingTrends';
import dashboardService from '../../../data/Service/dashboardService';
import './Dashboard.css';

const WIDGETS_PER_PAGE = 4;

const LoadingScreen = ({ message = 'Loading...' }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <RefreshCw size={32} className="text-blue-600 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Dashboard</h2>
            <p className="text-gray-600">{message}</p>
            <div className="mt-4">
                <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        recentAlerts: [],
        trainStats: { onTimePercentage: 0, delayedPercentage: 0, cancelledPercentage: 0 },
        stationTraffic: [],
        upcomingMaintenance: [],
        revenue: { total: 0, daily: 0, weekly: 0, monthly: 0, growth: 0 },
        liveTrains: [],
        passengerFlow: { current: 0, peak: 0, average: 0, hourlyFlow: [], trends: {} },
        systemPerformance: {
            systemHealth: { score: 0, status: 'unknown' },
            apiResponse: { time: 0, status: 'unknown' },
            networkStatus: { latency: 0, status: 'unknown' },
            databaseStatus: { queryTime: 0, connections: 0, load: 0, status: 'unknown' },
            alerts: []
        },
        bookingTrends: { totalBookings: 0, completionRate: 0, popularRoutes: [], timeDistribution: [], cancellationRate: 0 }
    });

    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [initialLoading, setInitialLoading] = useState(true);
    const [refreshLoading, setRefreshLoading] = useState(false);
    const [error, setError] = useState(null);
    const [timeFilter, setTimeFilter] = useState('today');
    const [filterType, setFilterType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchActive, setSearchActive] = useState(false);
    const [showCombinedFilters, setShowCombinedFilters] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const [dashboardLayout, setDashboardLayout] = useState([
        { id: 'alerts', title: 'System Alerts', visible: false, order: 1 },
        { id: 'trains', title: 'Train Status', visible: false, order: 2 },
        { id: 'stations', title: 'Station Traffic', visible: false, order: 3 },
        { id: 'maintenance', title: 'Maintenance', visible: false, order: 4 },
        { id: 'revenue', title: 'Revenue Analytics', visible: true, order: 5 },
        { id: 'liveTracking', title: 'Live Tracking', visible: false, order: 6 },
        { id: 'passengerFlow', title: 'Passenger Flow', visible: true, order: 7 },
        { id: 'systemPerformance', title: 'System Performance', visible: true, order: 8 },
        { id: 'bookingTrends', title: 'Booking Trends', visible: true, order: 9 }
    ]);

    const [notifications, setNotifications] = useState(() => {
        // Try to load from localStorage first
        const savedNotifications = localStorage.getItem('dashboardNotifications');
        if (savedNotifications) {
            try {
                return JSON.parse(savedNotifications);
            } catch (error) {
                console.error('Error parsing saved notifications:', error);
            }
        }

        // Fallback to default notifications
        return [
            { id: 1, text: 'Train T001 is running 15 minutes late', read: false },
            { id: 2, text: 'Maintenance scheduled for Platform 3 tomorrow', read: true },
            { id: 3, text: 'High passenger volume detected at Central Station', read: false }
        ];
    });

    const fetchDashboardData = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshLoading(true);
            } else {
                setInitialLoading(true);
            }
            setError(null);

            // Fetch real data from database
            const { bookings, tickets, trains, stations, passengers } = await dashboardService.getDashboardData();

            // Process the real data
            const processedData = {
                recentAlerts: [
                    { id: 1, type: 'Info', station: 'System', trainName: 'Dashboard', severity: 'low', time: 'Real-time' },
                    { id: 2, type: 'Status', station: 'Database', trainName: 'Connected', severity: 'low', time: 'Active' }
                ],
                trainStats: dashboardService.generateTrainStats(trains),
                stationTraffic: dashboardService.generateStationTraffic(tickets, stations),
                upcomingMaintenance: [
                    { id: 1, line: 'System', section: 'Database', date: new Date().toLocaleDateString(), time: 'Ongoing', duration: 'Active', status: 'operational' }
                ],
                revenue: tickets.length > 0
                    ? dashboardService.generateRevenueData(tickets)
                    : dashboardService.generateRevenueFromBookings(bookings),
                liveTrains: trains.slice(0, 8).map(train => ({
                    id: train.trainID,
                    name: train.trainName,
                    type: train.trainType || 'Express',
                    status: train.status || 'on-time',
                    currentStation: `Station ${train.trainID}`,
                    nextArrival: '12:30',
                    capacity: 200,
                    origin: 'Ha Noi',
                    destination: 'Sai Gon',
                    progress: Math.floor(Math.random() * 100)
                })),
                passengerFlow: dashboardService.generatePassengerFlow(tickets, passengers),
                systemPerformance: dashboardService.generateSystemPerformance(trains),
                bookingTrends: tickets.length > 0
                    ? dashboardService.generateBookingTrends(tickets, stations)
                    : dashboardService.generateBookingTrendsFromBookings(bookings, stations)
            };

            setDashboardData(processedData);
            console.log('Dashboard data loaded:', {
                trains: trains.length,
                tickets: tickets.length,
                stations: stations.length,
                passengers: passengers.length,
                bookings: bookings.length
            });

        } catch (err) {
            setError('Failed to load dashboard data. Please check your connection and try again.');
            console.error('Dashboard fetch error:', err);
        } finally {
            setInitialLoading(false);
            setRefreshLoading(false);
        }
    }, []);

    const getTotalPages = useCallback(() => {
        const visibleWidgets = dashboardLayout.filter(w => w.visible).length;
        return Math.ceil(visibleWidgets / WIDGETS_PER_PAGE);
    }, [dashboardLayout]);

    const getCurrentPageWidgets = useCallback(() => {
        const visibleWidgets = dashboardLayout.filter(w => w.visible).sort((a, b) => a.order - b.order);
        const startIndex = (currentPage - 1) * WIDGETS_PER_PAGE;
        const endIndex = startIndex + WIDGETS_PER_PAGE;
        return visibleWidgets.slice(startIndex, endIndex);
    }, [dashboardLayout, currentPage]);

    const goToPage = useCallback((page) => {
        const totalPages = getTotalPages();
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }, [getTotalPages]);

    const goToNextPage = useCallback(() => {
        goToPage(currentPage + 1);
    }, [goToPage, currentPage]);

    const goToPreviousPage = useCallback(() => {
        goToPage(currentPage - 1);
    }, [goToPage, currentPage]);

    const toggleWidgetVisibility = useCallback((id) => {
        setDashboardLayout(prev => prev.map(widget =>
            widget.id === id ? { ...widget, visible: !widget.visible } : widget
        ));
        setCurrentPage(1);
    }, []);

    const getSearchResults = useCallback(() => {
        if (!searchQuery.trim()) {
            setSearchActive(false);
            return dashboardData;
        }

        setSearchActive(true);
        const query = searchQuery.toLowerCase().trim();

        const filteredAlerts = dashboardData.recentAlerts.filter(alert =>
            alert.type.toLowerCase().includes(query) ||
            alert.station.toLowerCase().includes(query) ||
            alert.trainName.toLowerCase().includes(query)
        );

        const filteredStations = dashboardData.stationTraffic.filter(station =>
            station.name.toLowerCase().includes(query)
        );

        const filteredMaintenance = dashboardData.upcomingMaintenance.filter(item =>
            item.line.toLowerCase().includes(query) ||
            item.section.toLowerCase().includes(query) ||
            item.date.toLowerCase().includes(query) ||
            item.status.toLowerCase().includes(query)
        );

        return {
            recentAlerts: filteredAlerts,
            stationTraffic: filteredStations,
            upcomingMaintenance: filteredMaintenance,
            trainStats: dashboardData.trainStats
        };
    }, [searchQuery, dashboardData]);

    const filteredData = useMemo(() => getSearchResults(), [getSearchResults]);

    const formattedDateTime = currentDateTime.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetchDashboardData();
        const refreshInterval = setInterval(() => fetchDashboardData(true), 5 * 60 * 1000);
        return () => clearInterval(refreshInterval);
    }, [fetchDashboardData]);

    useEffect(() => {
        const totalPages = getTotalPages();
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [dashboardLayout, currentPage, getTotalPages]);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.key === 'ArrowLeft' && currentPage > 1) {
                goToPreviousPage();
            } else if (e.key === 'ArrowRight' && currentPage < getTotalPages()) {
                goToNextPage();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentPage, goToPreviousPage, goToNextPage, getTotalPages]);

    useEffect(() => {
        try {
            localStorage.setItem('dashboardNotifications', JSON.stringify(notifications));
        } catch (error) {
            console.error('Error saving notifications to localStorage:', error);
        }
    }, [notifications]);

    if (initialLoading) {
        return <LoadingScreen message="Loading dashboard from database..." />;
    }

    const totalPages = getTotalPages();
    const currentPageWidgets = getCurrentPageWidgets();

    const handleSearchChange = (e) => setSearchQuery(e.target.value);
    const clearSearch = () => { setSearchQuery(''); setSearchActive(false); };
    const handleSearchKeyPress = (e) => { if (e.key === 'Escape') clearSearch(); };
    const handleRefresh = () => fetchDashboardData(true);

    const setTimeFilterOption = (filter) => {
        setTimeFilter(filter);
        setShowCombinedFilters(false);
        fetchDashboardData(true);
    };

    const setCategoryFilter = (filter) => {
        setFilterType(filter);
        setShowCombinedFilters(false);
        fetchDashboardData(true);
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        setShowCombinedFilters(false);
    };

    const markAllAsRead = () => {
        const updatedNotifications = notifications.map(notification => ({
            ...notification,
            read: true
        }));

        setNotifications(updatedNotifications);

        try {
            localStorage.setItem('dashboardNotifications', JSON.stringify(updatedNotifications));
        } catch (error) {
            console.error('Error saving notifications to localStorage:', error);
        }
    };

    return (
        <div className="h-screen flex flex-col dashboard relative">
            {refreshLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="mt-2 text-sm text-gray-600">Refreshing from database...</p>
                    </div>
                </div>
            )}

            <header className="bg-white shadow-sm z-10 flex-shrink-0">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center">
                        <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
                        <span className="ml-3 text-sm text-gray-500 leading-none">{formattedDateTime}</span>
                        {totalPages > 1 && (
                            <span className="ml-4 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                Page {currentPage} of {totalPages}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search dashboard..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onKeyDown={handleSearchKeyPress}
                                className={`pl-9 pr-10 py-2 rounded-lg border transition-all duration-200 ${searchActive ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500 w-64`}
                            />
                            <Search size={18} className={`absolute left-3 top-2.5 ${searchActive ? 'text-blue-500' : 'text-gray-400'}`} />
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                    title="Clear search"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowCombinedFilters(!showCombinedFilters);
                                    setShowNotifications(false);
                                }}
                                className="flex items-center px-3 py-1.5 rounded-lg hover:bg-gray-100"
                                title="Filters"
                            >
                                <Filter size={16} className="text-gray-600 mr-1.5" />
                                <div className="text-sm text-gray-700 flex items-center">
                                    <span className="mr-1">
                                        {filterType === 'all' ? 'All' :
                                            filterType === 'onTime' ? 'On-time' :
                                                filterType === 'delayed' ? 'Delayed' : 'Maintenance'}
                                    </span>
                                    <span className="mx-1 text-gray-400">•</span>
                                    <span>
                                        {timeFilter === 'today' ? 'Today' :
                                            timeFilter === 'week' ? 'This Week' : 'This Month'}
                                    </span>
                                </div>
                                <ChevronDown size={14} className="text-gray-500 ml-1.5" />
                            </button>

                            {showCombinedFilters && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 z-20 border border-gray-200">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <h3 className="font-semibold text-gray-700">Filters</h3>
                                    </div>

                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-xs text-gray-500 font-medium mb-2">CATEGORY</p>
                                        <div className="space-y-2">
                                            {[
                                                { key: 'all', label: 'All' },
                                                { key: 'onTime', label: 'On-time Trains' },
                                                { key: 'delayed', label: 'Delayed Trains' },
                                                { key: 'maintenance', label: 'Maintenance Only' }
                                            ].map(({ key, label }) => (
                                                <button
                                                    key={key}
                                                    onClick={() => setCategoryFilter(key)}
                                                    className={`w-full text-left px-3 py-1.5 text-sm flex items-center rounded ${filterType === key ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="px-4 py-2">
                                        <p className="text-xs text-gray-500 font-medium mb-2">TIME PERIOD</p>
                                        <div className="space-y-2">
                                            {[
                                                { key: 'today', label: 'Today' },
                                                { key: 'week', label: 'This Week' },
                                                { key: 'month', label: 'This Month' }
                                            ].map(({ key, label }) => (
                                                <button
                                                    key={key}
                                                    onClick={() => setTimeFilterOption(key)}
                                                    className={`w-full text-left px-3 py-1.5 text-sm flex items-center rounded ${timeFilter === key ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <Clock size={14} className="mr-2" />
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <button
                                onClick={toggleNotifications}
                                className="p-2 rounded-lg hover:bg-gray-100 relative"
                            >
                                <Bell size={20} className="text-gray-600" />
                                {notifications.some(n => !n.read) && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-20 border border-gray-200">
                                    <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                        <h3 className="font-semibold text-gray-700">Notifications</h3>
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-xs text-blue-600 hover:text-blue-800"
                                        >
                                            Mark all as read
                                        </button>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.map(notification => (
                                                <div
                                                    key={notification.id}
                                                    className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${notification.read ? 'opacity-70' : ''
                                                        }`}
                                                >
                                                    <p className="text-sm text-gray-800">{notification.text}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-center text-gray-500">
                                                No notifications
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleRefresh}
                            disabled={refreshLoading}
                            className="flex items-center px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw size={18} className={`mr-1.5 ${refreshLoading ? 'animate-spin' : ''}`} />
                            <span className="text-sm">{refreshLoading ? 'Refreshing...' : 'Refresh'}</span>
                        </button>

                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`py-1.5 px-3 text-sm rounded-lg ${isEditing ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                } hover:bg-opacity-90`}
                        >
                            {isEditing ? 'Done' : 'Edit View'}
                        </button>

                        {isEditing && (
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                            >
                                Save Layout
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-hidden p-4 bg-gray-100">
                {searchActive && (
                    <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                        <div className="flex items-center">
                            <Search size={16} className="text-blue-500 mr-2" />
                            <span className="text-sm text-blue-700">
                                Search results for "<strong>{searchQuery}</strong>"
                            </span>
                        </div>
                        <button onClick={clearSearch} className="text-blue-500 hover:text-blue-700 text-sm">
                            Clear
                        </button>
                    </div>
                )}

                {searchActive &&
                    filteredData.recentAlerts.length === 0 &&
                    filteredData.stationTraffic.length === 0 &&
                    filteredData.upcomingMaintenance.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <AlertCircle size={40} className="text-gray-400 mb-3" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-1">No results found</h3>
                            <p className="text-gray-500 mb-4">Try a different search term or clear the search</p>
                            <button
                                onClick={clearSearch}
                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                            >
                                Clear Search
                            </button>
                        </div>
                    )}

                {error && (
                    <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                        <p>{error}</p>
                        <button
                            onClick={handleRefresh}
                            className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!error && (
                    <>
                        <div className="h-full flex flex-col">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 min-h-0">
                                {currentPageWidgets.map(widget => {
                                    const iconMap = {
                                        alerts: AlertTriangle,
                                        trains: Train,
                                        stations: MapPin,
                                        maintenance: Calendar,
                                        revenue: DollarSign,
                                        liveTracking: Activity,
                                        passengerFlow: UsersIcon,
                                        systemPerformance: Activity,
                                        bookingTrends: TrendingUpIcon
                                    };
                                    const IconComponent = iconMap[widget.id];

                                    return (
                                        <div
                                            key={widget.id}
                                            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 flex flex-col min-h-0 max-h-80"
                                        >
                                            <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                                                <h3 className="font-bold text-blue-600 flex items-center gap-2 text-sm">
                                                    {IconComponent && <IconComponent size={14} />}
                                                    {widget.title}
                                                </h3>
                                                {isEditing && (
                                                    <div className="flex space-x-1">
                                                        <button
                                                            onClick={() => toggleWidgetVisibility(widget.id)}
                                                            className="p-1 hover:bg-gray-200 rounded"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 p-3 overflow-hidden min-h-0">
                                                {widget.id === 'alerts' && (
                                                    <SystemAlerts alerts={searchActive ? filteredData.recentAlerts : dashboardData.recentAlerts} />
                                                )}
                                                {widget.id === 'trains' && (
                                                    <TrainStatus
                                                        stats={[
                                                            { label: 'On Time', value: dashboardData.trainStats.onTimePercentage, color: 'bg-green-500' },
                                                            { label: 'Delayed', value: dashboardData.trainStats.delayedPercentage, color: 'bg-yellow-500' },
                                                            { label: 'Cancelled', value: dashboardData.trainStats.cancelledPercentage, color: 'bg-red-500' }
                                                        ]}
                                                    />
                                                )}
                                                {widget.id === 'stations' && (
                                                    <StationTraffic
                                                        stations={searchActive ? filteredData.stationTraffic : dashboardData.stationTraffic}
                                                        timeFilter={timeFilter}
                                                    />
                                                )}
                                                {widget.id === 'maintenance' && (
                                                    <Maintenance maintenance={searchActive ? filteredData.upcomingMaintenance : dashboardData.upcomingMaintenance} />
                                                )}
                                                {widget.id === 'revenue' && (
                                                    <RevenueAnalytics
                                                        revenue={dashboardData.revenue}
                                                        timeFilter={timeFilter}
                                                    />
                                                )}
                                                {widget.id === 'liveTracking' && (
                                                    <LiveTrainTracking
                                                        trains={dashboardData.liveTrains}
                                                        timeFilter={timeFilter}
                                                    />
                                                )}
                                                {widget.id === 'passengerFlow' && (
                                                    <PassengerFlow
                                                        passengerData={dashboardData.passengerFlow}
                                                        timeFilter={timeFilter}
                                                    />
                                                )}
                                                {widget.id === 'systemPerformance' && (
                                                    <SystemPerformance
                                                        performance={dashboardData.systemPerformance}
                                                    />
                                                )}
                                                {widget.id === 'bookingTrends' && (
                                                    <BookingTrends
                                                        bookingData={dashboardData.bookingTrends}
                                                        timeFilter={timeFilter}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-4 flex items-center justify-center space-x-4 flex-shrink-0">
                                    <button
                                        onClick={goToPreviousPage}
                                        disabled={currentPage === 1}
                                        className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${currentPage === 1
                                            ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                                            }`}
                                    >
                                        <ChevronDown size={16} className="rotate-90 mr-1" />
                                        Previous
                                    </button>

                                    <div className="flex items-center space-x-2">
                                        {Array.from({ length: totalPages }, (_, index) => {
                                            const page = index + 1;
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => goToPage(page)}
                                                    className={`w-10 h-10 rounded-lg border transition-colors ${currentPage === page
                                                        ? 'border-blue-500 bg-blue-500 text-white'
                                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={goToNextPage}
                                        disabled={currentPage === totalPages}
                                        className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${currentPage === totalPages
                                            ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                                            }`}
                                    >
                                        Next
                                        <ChevronDown size={16} className="-rotate-90 ml-1" />
                                    </button>
                                </div>
                            )}

                            {totalPages > 1 && (
                                <div className="mt-2 text-center flex-shrink-0">
                                    <p className="text-xs text-gray-500">
                                        {((currentPage - 1) * WIDGETS_PER_PAGE) + 1}-{Math.min(currentPage * WIDGETS_PER_PAGE, dashboardLayout.filter(w => w.visible).length)} of {dashboardLayout.filter(w => w.visible).length} widgets
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default Dashboard;