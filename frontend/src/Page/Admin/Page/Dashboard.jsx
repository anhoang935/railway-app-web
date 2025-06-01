import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SystemAlerts from '../Widgets/SystemAlerts';
import TrainStatus from '../Widgets/TrainStatus';
import Maintenance from '../Widgets/Maintenance';
import StationTraffic from '../Widgets/StationTraffic';
import {
    AlertTriangle, Train, MapPin, Calendar, Search, Bell,
    RefreshCw, Filter, Clock, ChevronDown, X, AlertCircle
} from 'lucide-react';

// Import services
import trainService from '../../../data/Service/trainService';
import scheduleService from '../../../data/Service/scheduleService';
import stationService from '../../../data/Service/stationService';
import ticketService from '../../../data/Service/ticketService';
import journeyService from '../../../data/Service/journeyService';

const Dashboard = () => {
    // Local state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [searchActive, setSearchActive] = useState(false);
    const [timeFilter, setTimeFilter] = useState('today');
    const [showTimeFilterOptions, setShowTimeFilterOptions] = useState(false);
    const [showFilterOptions, setShowFilterOptions] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [showCombinedFilters, setShowCombinedFilters] = useState(false);

    // Dashboard data
    const [dashboardData, setDashboardData] = useState({
        recentAlerts: [],
        trainStats: {
            onTime: 0,
            delayed: 0,
            cancelled: 0,
            total: 0,
            onTimePercentage: 0,
            delayedPercentage: 0,
            cancelledPercentage: 0
        },
        stationTraffic: [],
        upcomingMaintenance: [],
        activeJourneys: 0,
        ticketSales: { today: 0, thisWeek: 0, thisMonth: 0 }
    });

    // Dashboard layout with visibility control
    const [dashboardLayout, setDashboardLayout] = useState([
        { id: 'alerts', title: 'System Alerts', visible: true, order: 1 },
        { id: 'trains', title: 'Train Status', visible: true, order: 2 },
        { id: 'stations', title: 'Station Traffic', visible: true, order: 3 },
        { id: 'maintenance', title: 'Maintenance Schedule', visible: true, order: 4 }
    ]);

    // Format date for display
    const formattedDateTime = currentDateTime.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Update time every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    // Main data fetching function
    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all required data in parallel
            const [trains, schedules, stations, tickets, journeys] = await Promise.all([
                trainService.getAllTrains(),
                scheduleService.getAllSchedules(),
                stationService.getAllStations(),
                ticketService.getAllTickets().catch(() => []), // Handle if endpoint is not available
                journeyService.getAllJourneys().catch(() => []) // Handle if endpoint is not available
            ]);

            // Process data for each widget
            const processedData = {
                recentAlerts: generateSystemAlerts(trains, schedules),
                trainStats: calculateTrainStats(trains, schedules),
                stationTraffic: calculateStationTraffic(stations, tickets, journeys),
                upcomingMaintenance: getUpcomingMaintenance(schedules),
                activeJourneys: countActiveJourneys(journeys),
                ticketSales: calculateTicketSales(tickets)
            };

            // Apply time filter
            const filteredData = filterDataByTimeRange(processedData, timeFilter);

            // Apply category filter
            const categoryFilteredData = filterDataByCategory(filteredData, filterType);

            setDashboardData(categoryFilteredData);

            // Generate notifications from alerts
            const newNotifications = processedData.recentAlerts
                .slice(0, 3)
                .map((alert, idx) => ({
                    id: `notification-${idx}`,
                    text: `${alert.type} at ${alert.station}: ${alert.time}`,
                    read: false,
                    timestamp: new Date()
                }));

            setNotifications(newNotifications);

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [timeFilter, filterType]);

    // Initial data fetch
    useEffect(() => {
        fetchDashboardData();

        // Refresh data every 5 minutes
        const refreshInterval = setInterval(fetchDashboardData, 5 * 60 * 1000);
        return () => clearInterval(refreshInterval);
    }, [fetchDashboardData]);

    // -- Data Processing Functions --

    // Process train data to calculate statistics
    function calculateTrainStats(trains, schedules) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Apply time filter
        let filteredSchedules = schedules;
        if (timeFilter === 'today') {
            filteredSchedules = schedules.filter(schedule => {
                const scheduleDate = schedule.departureTime ? new Date(schedule.departureTime) : null;
                return scheduleDate && scheduleDate >= today && scheduleDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
            });
        } else if (timeFilter === 'week') {
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            filteredSchedules = schedules.filter(schedule => {
                const scheduleDate = schedule.departureTime ? new Date(schedule.departureTime) : null;
                return scheduleDate && scheduleDate >= weekStart;
            });
        } else if (timeFilter === 'month') {
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            filteredSchedules = schedules.filter(schedule => {
                const scheduleDate = schedule.departureTime ? new Date(schedule.departureTime) : null;
                return scheduleDate && scheduleDate >= monthStart;
            });
        }

        let onTime = 0;
        let delayed = 0;
        let cancelled = 0;

        filteredSchedules.forEach(schedule => {
            if (schedule.scheduleStatus === 'on-time') onTime++;
            else if (schedule.scheduleStatus === 'delayed') delayed++;
            else if (schedule.scheduleStatus === 'cancelled') cancelled++;
        });

        const total = filteredSchedules.length;

        return {
            onTime,
            delayed,
            cancelled,
            total,
            onTimePercentage: total > 0 ? Math.round((onTime / total) * 100) : 0,
            delayedPercentage: total > 0 ? Math.round((delayed / total) * 100) : 0,
            cancelledPercentage: total > 0 ? Math.round((cancelled / total) * 100) : 0
        };
    }

    // Process station and ticket data to calculate station traffic
    function calculateStationTraffic(stations, tickets, journeys) {
        const stationMap = {};

        // Initialize station data
        stations.forEach(station => {
            stationMap[station.stationID] = {
                id: station.stationID,
                name: station.stationName,
                passengers: 0,
                trains: 0
            };
        });

        // Count tickets per station
        tickets.forEach(ticket => {
            if (ticket.departure_stationID && stationMap[ticket.departure_stationID]) {
                stationMap[ticket.departure_stationID].passengers++;
            }
            if (ticket.arrival_stationID && stationMap[ticket.arrival_stationID]) {
                stationMap[ticket.arrival_stationID].passengers++;
            }
        });

        // Count trains per station from journeys
        journeys.forEach(journey => {
            if (journey.stationID && stationMap[journey.stationID]) {
                stationMap[journey.stationID].trains++;
            }
        });

        // Convert to array and sort by passenger count (default sort)
        return Object.values(stationMap)
            .sort((a, b) => b.passengers - a.passengers)
            .slice(0, 3); // Top 3 stations
    }

    // Extract upcoming maintenance schedules
    function getUpcomingMaintenance(schedules) {
        const now = new Date();

        return schedules
            .filter(schedule =>
                schedule.scheduleStatus === 'maintenance' &&
                schedule.departureTime &&
                new Date(schedule.departureTime) > now
            )
            .map(schedule => ({
                id: schedule.scheduleID,
                line: schedule.trainID ? `Line ${schedule.trainID}` : 'Unknown Line',
                section: `${schedule.start_stationName || 'Unknown'} - ${schedule.end_stationName || 'Unknown'}`,
                date: new Date(schedule.departureTime).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                }),
                status: 'Scheduled'
            }))
            .slice(0, 5); // Top 5 maintenance tasks
    }

    // Generate system alerts from train and schedule data
    function generateSystemAlerts(trains, schedules) {
        const alerts = [];

        // Check for delayed/cancelled trains and maintenance
        schedules.forEach(schedule => {
            if (!schedule.departureTime) return;

            const departureTime = new Date(schedule.departureTime);
            const trainInfo = trains.find(train => train.trainID === schedule.trainID);
            const trainName = trainInfo ? trainInfo.trainName : 'Unknown Train';

            // Format time ago
            const timeAgo = formatTimeAgo(departureTime);

            if (schedule.scheduleStatus === 'delayed') {
                alerts.push({
                    id: `delay-${schedule.scheduleID}`,
                    type: 'Delay',
                    station: schedule.start_stationName || 'Unknown Station',
                    time: timeAgo,
                    trainName,
                    severity: 'medium'
                });
            } else if (schedule.scheduleStatus === 'cancelled') {
                alerts.push({
                    id: `cancel-${schedule.scheduleID}`,
                    type: 'Cancellation',
                    station: schedule.start_stationName || 'Unknown Station',
                    time: timeAgo,
                    trainName,
                    severity: 'high'
                });
            } else if (schedule.scheduleStatus === 'maintenance') {
                alerts.push({
                    id: `maint-${schedule.scheduleID}`,
                    type: 'Maintenance',
                    station: schedule.start_stationName || 'Unknown Station',
                    time: timeAgo,
                    trainName,
                    severity: 'low'
                });
            }
        });

        // Sort by time (most recent first) and limit to 5 items
        return alerts
            .sort((a, b) =>
                getMinutesFromTimeAgo(a.time) - getMinutesFromTimeAgo(b.time)
            )
            .slice(0, 5);
    }

    // Helper to convert time ago string to minutes for sorting
    function getMinutesFromTimeAgo(timeAgo) {
        if (timeAgo.includes('just now')) return 0;

        const match = timeAgo.match(/^(\d+)\s+(\w+)/);
        if (!match) return 999999;

        const number = parseInt(match[1], 10);
        const unit = match[2];

        if (unit.includes('min')) return number;
        if (unit.includes('hour')) return number * 60;
        if (unit.includes('day')) return number * 24 * 60;

        return 999999;
    }

    // Helper to format time ago string
    function formatTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins} mins ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hours ago`;

        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} days ago`;
    }

    // Calculate ticket sales statistics
    function calculateTicketSales(tickets) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        let todayCount = 0;
        let weekCount = 0;
        let monthCount = 0;

        tickets.forEach(ticket => {
            const ticketDate = ticket.departureDate ? new Date(ticket.departureDate) : null;
            if (!ticketDate) return;

            if (ticketDate >= today) {
                todayCount++;
            }

            if (ticketDate >= weekStart) {
                weekCount++;
            }

            if (ticketDate >= monthStart) {
                monthCount++;
            }
        });

        return { today: todayCount, thisWeek: weekCount, thisMonth: monthCount };
    }

    // Count active journeys
    function countActiveJourneys(journeys) {
        const now = new Date();

        return journeys.filter(journey => {
            if (!journey.departureTime || !journey.arrivalTime) return false;

            const departureTime = new Date(journey.departureTime);
            const arrivalTime = new Date(journey.arrivalTime);

            return departureTime <= now && arrivalTime >= now;
        }).length;
    }

    // Filter data based on time range
    function filterDataByTimeRange(data, timeRange) {
        // We already filter by time in individual processing functions
        return data;
    }

    // Filter data by category (train status, station, etc)
    function filterDataByCategory(data, category) {
        if (category === 'all') return data;

        // Apply specific filters based on category
        if (category === 'onTime') {
            // Show only on-time trains
            const filteredAlerts = data.recentAlerts.filter(
                alert => alert.type !== 'Delay' && alert.type !== 'Cancellation'
            );
            return { ...data, recentAlerts: filteredAlerts };
        } else if (category === 'delayed') {
            // Show only delayed/cancelled trains
            const filteredAlerts = data.recentAlerts.filter(
                alert => alert.type === 'Delay' || alert.type === 'Cancellation'
            );
            return { ...data, recentAlerts: filteredAlerts };
        } else if (category === 'maintenance') {
            // Show only maintenance alerts
            const filteredAlerts = data.recentAlerts.filter(
                alert => alert.type === 'Maintenance'
            );
            return { ...data, recentAlerts: filteredAlerts };
        }

        return data;
    }

    // -- Event Handlers --

    // Toggle widget visibility
    const toggleWidgetVisibility = (id) => {
        setDashboardLayout(prev =>
            prev.map(widget =>
                widget.id === id ? { ...widget, visible: !widget.visible } : widget
            )
        );
    };

    // Add this function to perform the search
    const getSearchResults = useCallback(() => {
        if (!searchQuery.trim()) {
            setSearchActive(false);
            return {
                recentAlerts: dashboardData.recentAlerts,
                stationTraffic: dashboardData.stationTraffic,
                upcomingMaintenance: dashboardData.upcomingMaintenance,
                trainStats: dashboardData.trainStats
            };
        }

        setSearchActive(true);
        const query = searchQuery.toLowerCase().trim();

        // Filter alerts
        const filteredAlerts = dashboardData.recentAlerts.filter(alert =>
            alert.type.toLowerCase().includes(query) ||
            alert.station.toLowerCase().includes(query) ||
            alert.trainName.toLowerCase().includes(query)
        );

        // Filter stations
        const filteredStations = dashboardData.stationTraffic.filter(station =>
            station.name.toLowerCase().includes(query)
        );

        // Filter maintenance
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
            trainStats: dashboardData.trainStats // Keep stats as is
        };
    }, [searchQuery, dashboardData]);

    // Calculate filtered data based on search query
    const filteredData = useMemo(() => getSearchResults(), [searchQuery, getSearchResults]);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Clear search
    const clearSearch = () => {
        setSearchQuery('');
        setSearchActive(false);
    };

    // Handle key press in search field
    const handleSearchKeyPress = (e) => {
        if (e.key === 'Escape') {
            clearSearch();
        }
    };

    // Handle manual refresh
    const handleRefresh = () => {
        fetchDashboardData();
    };

    // Toggle time filter dropdown
    const toggleTimeFilter = () => {
        setShowTimeFilterOptions(!showTimeFilterOptions);
        setShowFilterOptions(false);
    };

    // Toggle filter dropdown
    const toggleFilterOptions = () => {
        setShowFilterOptions(!showFilterOptions);
        setShowTimeFilterOptions(false);
    };

    // Set time filter and close dropdown
    const setTimeFilterOption = (filter) => {
        setTimeFilter(filter);
        setShowCombinedFilters(false);
        fetchDashboardData(); // Refetch with new filter
    };

    // Set category filter and close dropdown
    const setCategoryFilter = (filter) => {
        setFilterType(filter);
        setShowCombinedFilters(false);
        fetchDashboardData(); // Refetch with new filter
    };

    // Toggle notifications panel
    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        setShowCombinedFilters(false);
    };

    // Mark all notifications as read
    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, read: true }))
        );
    };

    // Sorted widgets for display
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
                            {/* Enhanced Search input */}
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

                        {/* Combined Filter button */}
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
                                                filterType === 'delayed' ? 'Delayed' :
                                                    'Maintenance'}
                                    </span>
                                    <span className="mx-1 text-gray-400">•</span>
                                    <span>
                                        {timeFilter === 'today' ? 'Today' :
                                            timeFilter === 'week' ? 'This Week' :
                                                'This Month'}
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
                                            <button
                                                onClick={() => setCategoryFilter('all')}
                                                className={`w-full text-left px-3 py-1.5 text-sm flex items-center rounded ${filterType === 'all' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                                            >
                                                All
                                            </button>
                                            <button
                                                onClick={() => setCategoryFilter('onTime')}
                                                className={`w-full text-left px-3 py-1.5 text-sm flex items-center rounded ${filterType === 'onTime' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                                            >
                                                On-time Trains
                                            </button>
                                            <button
                                                onClick={() => setCategoryFilter('delayed')}
                                                className={`w-full text-left px-3 py-1.5 text-sm flex items-center rounded ${filterType === 'delayed' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                                            >
                                                Delayed Trains
                                            </button>
                                            <button
                                                onClick={() => setCategoryFilter('maintenance')}
                                                className={`w-full text-left px-3 py-1.5 text-sm flex items-center rounded ${filterType === 'maintenance' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                                            >
                                                Maintenance Only
                                            </button>
                                        </div>
                                    </div>

                                    <div className="px-4 py-2">
                                        <p className="text-xs text-gray-500 font-medium mb-2">TIME PERIOD</p>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => setTimeFilterOption('today')}
                                                className={`w-full text-left px-3 py-1.5 text-sm flex items-center rounded ${timeFilter === 'today' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                                            >
                                                <Clock size={14} className="mr-2" />
                                                Today
                                            </button>
                                            <button
                                                onClick={() => setTimeFilterOption('week')}
                                                className={`w-full text-left px-3 py-1.5 text-sm flex items-center rounded ${timeFilter === 'week' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                                            >
                                                <Clock size={14} className="mr-2" />
                                                This Week
                                            </button>
                                            <button
                                                onClick={() => setTimeFilterOption('month')}
                                                className={`w-full text-left px-3 py-1.5 text-sm flex items-center rounded ${timeFilter === 'month' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                                            >
                                                <Clock size={14} className="mr-2" />
                                                This Month
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Notifications */}
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
                                                    className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${notification.read ? 'opacity-70' : ''}`}
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

                        {/* Refresh button */}
                        <button
                            onClick={handleRefresh}
                            className="flex items-center px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-700"
                        >
                            <RefreshCw size={18} className={`mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                            <span className="text-sm">{loading ? 'Refreshing...' : 'Refresh'}</span>
                        </button>

                        {/* Edit View button */}
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`py-1.5 px-3 text-sm rounded-lg ${isEditing ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'} hover:bg-opacity-90`}
                        >
                            {isEditing ? 'Done' : 'Edit View'}
                        </button>

                        {/* Save Layout button - moved from second header */}
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

            <main className="flex-1 overflow-y-auto p-4 bg-gray-100">
                {/* Search results indicator */}
                {searchActive && (
                    <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                        <div className="flex items-center">
                            <Search size={16} className="text-blue-500 mr-2" />
                            <span className="text-sm text-blue-700">
                                Search results for "<strong>{searchQuery}</strong>"
                            </span>
                        </div>
                        <button
                            onClick={clearSearch}
                            className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                            Clear
                        </button>
                    </div>
                )}

                {/* No results indicator */}
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

                {loading && !error && !searchActive && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {!loading && !error && (
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
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </>
    );
};

export default Dashboard;