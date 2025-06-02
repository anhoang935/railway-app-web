import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart3, Train, Users, Calendar, Settings, MapPin,
    LogOut, ArrowLeftToLine, Menu, ChevronDown, ChevronRight,
    Route, CreditCard, UserCheck, Ticket, User
} from 'lucide-react';
import "./admin.css";

import Dashboard from './Page/Dashboard';
import TrainManagement from './Page/TrainManagement';
import StationManagement from './Page/StationManagement';
import JourneyManagement from './Page/JourneyManagement';
import UsersManagement from './Page/UsersManagement';
import StaffUsers from './Page/StaffUsers';
import StaffMembers from './Page/StaffMembers';
import Scheduling from './Page/Scheduling';
import AdminSettings from './Page/AdminSettings';
import BookingManagement from './Page/BookingManagement';
import PassengerManagement from './Page/PassengerManagement';
import TrackManagement from './Page/TrackManagement';

import NavItem from './Components/NavItem';

const recentAlerts = [
    { id: 1, type: 'Delay', station: 'Central Station', time: '10 mins ago', severity: 'medium' },
    { id: 2, type: 'Maintenance', station: 'North Junction', time: '25 mins ago', severity: 'low' },
    { id: 3, type: 'Emergency', station: 'South Terminal', time: '1 hour ago', severity: 'high' }
];

const stationTraffic = [
    { id: 1, name: 'Central Station', passengers: 15420, trains: 142 },
    { id: 2, name: 'North Junction', passengers: 12800, trains: 98 },
    { id: 3, name: 'East Terminal', passengers: 11300, trains: 87 },
    { id: 4, name: 'West Station', passengers: 9300, trains: 110 }
];

const upcomingMaintenance = [
    { id: 1, line: 'Blue Line', section: 'Central - North', date: 'Apr 22, 2025', status: 'Scheduled' },
    { id: 2, line: 'Red Line', section: 'East - South', date: 'Apr 25, 2025', status: 'Pending' }
];

export default function AdminPanel() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState("dashboard");
    const [showNotification, setShowNotification] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState([]);
    const navigate = useNavigate();
    const [dashboardLayout, setDashboardLayout] = useState([
        { id: 'alerts', title: 'System Alerts', visible: true, order: 1 },
        { id: 'trains', title: 'Train Status', visible: true, order: 2 },
        { id: 'stations', title: 'Station Traffic', visible: true, order: 3 },
        { id: 'maintenance', title: 'Maintenance Schedule', visible: true, order: 4 }
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const toggleWidgetVisibility = (widgetId) => {
        setDashboardLayout(layout =>
            layout.map(widget =>
                widget.id === widgetId
                    ? { ...widget, visible: !widget.visible }
                    : widget
            )
        );
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleSaveChanges = () => {
        console.log("Saving changes to dashboard layout");
        setIsEditing(false);
        setShowNotification(true);
        setTimeout(() => {
            setShowNotification(false);
        }, 3000);
    };

    const handleLogout = () => {
        navigate('/home');
    }

    const toggleSubmenu = (menu) => {
        setExpandedMenus(prev =>
            prev.includes(menu)
                ? prev.filter(item => item !== menu)
                : [...prev, menu]
        );
    };

    const isMenuExpanded = (menu) => {
        return expandedMenus.includes(menu);
    };

    const formattedDateTime = currentTime.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard":
                return <Dashboard />;
            case "trains":
                return <TrainManagement setActiveTab={setActiveTab} />;
            case "stations":
                return <StationManagement setActiveTab={setActiveTab} />;
            case "journey":
                return <JourneyManagement setActiveTab={setActiveTab} />;
            case "scheduling":
                return <Scheduling setActiveTab={setActiveTab} />;
            case "bookings":
                return <BookingManagement setActiveTab={setActiveTab} />;
            case "passengers":
                return <PassengerManagement setActiveTab={setActiveTab} />;
            case "staff-users":
                return <StaffUsers setActiveTab={setActiveTab} />;
            case "staff-members":
                return <StaffMembers setActiveTab={setActiveTab} />;
            case "settings":
                return <AdminSettings setActiveTab={setActiveTab} />;
            case "tracks":
                return <TrackManagement setActiveTab={setActiveTab} />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <div
                className={`${sidebarOpen ? 'w-64' : 'w-20'} text-white transition-all duration-300 flex flex-col`}
                style={{
                    background: '#1e3c72',
                    backgroundSize: '600% 600%',
                    animation: 'gradientMove 5s ease infinite'
                }}
            >
                <div className="p-4 flex items-center justify-between">
                    {sidebarOpen ? (
                        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                    ) : (
                        <span></span>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-1 rounded-md hover:bg-blue-700"
                    >
                        {sidebarOpen ? <ArrowLeftToLine size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="mt-2 flex-1">
                    {/* Dashboard - Overview */}
                    <NavItem
                        icon={<BarChart3 size={20} />}
                        label="Dashboard"
                        active={activeTab === "dashboard"}
                        expanded={sidebarOpen}
                        onClick={() => setActiveTab("dashboard")}
                    />

                    {/* Transportation Management Group */}
                    {sidebarOpen && (
                        <div className="px-4 py-2 text-xs font-semibold text-blue-200 uppercase tracking-wider mt-4">
                            Transportation
                        </div>
                    )}
                    <NavItem
                        icon={<Train size={20} />}
                        label="Train Management"
                        active={activeTab === "trains"}
                        expanded={sidebarOpen}
                        onClick={() => setActiveTab("trains")}
                    />
                    <NavItem
                        icon={<MapPin size={20} />}
                        label="Stations"
                        active={activeTab === "stations"}
                        expanded={sidebarOpen}
                        onClick={() => setActiveTab("stations")}
                    />
                    <NavItem
                        icon={<Route size={20} />}
                        label="Journey"
                        active={activeTab === "journey"}
                        expanded={sidebarOpen}
                        onClick={() => setActiveTab("journey")}
                    />
                    <NavItem
                        icon={<Calendar size={20} />}
                        label="Scheduling"
                        active={activeTab === "scheduling"}
                        expanded={sidebarOpen}
                        onClick={() => setActiveTab("scheduling")}
                    />
                    <NavItem
                        icon={<CreditCard size={20} />}
                        label="Tracks"
                        active={activeTab === "tracks"}
                        expanded={sidebarOpen}
                        onClick={() => setActiveTab("tracks")}
                    />

                    {/* Customer Management Group */}
                    {sidebarOpen && (
                        <div className="px-4 py-2 text-xs font-semibold text-blue-200 uppercase tracking-wider mt-4">
                            Customer Management
                        </div>
                    )}
                    <NavItem
                        icon={<Ticket size={20} />}
                        label="Bookings"
                        active={activeTab === "bookings"}
                        expanded={sidebarOpen}
                        onClick={() => setActiveTab("bookings")}
                    />
                    <NavItem
                        icon={<User size={20} />}
                        label="Passengers"
                        active={activeTab === "passengers"}
                        expanded={sidebarOpen}
                        onClick={() => setActiveTab("passengers")}
                    />

                    {/* User Management Group */}
                    {sidebarOpen && (
                        <div className="px-4 py-2 text-xs font-semibold text-blue-200 uppercase tracking-wider mt-4">
                            User Management
                        </div>
                    )}
                    <NavItem
                        icon={<UserCheck size={20} />}
                        label="Customer"
                        active={activeTab === "staff-users"}
                        expanded={sidebarOpen}
                        onClick={() => setActiveTab("staff-users")}
                    />
                    <NavItem
                        icon={<Users size={20} />}
                        label="Admin"
                        active={activeTab === "staff-members"}
                        expanded={sidebarOpen}
                        onClick={() => setActiveTab("staff-members")}
                    />

                    {/* Settings */}
                    <div className="mt-4">
                        <NavItem
                            icon={<Settings size={20} />}
                            label="Settings"
                            active={activeTab === "settings"}
                            expanded={sidebarOpen}
                            onClick={() => setActiveTab("settings")}
                        />
                    </div>
                </nav>

                <div className="p-4 border-t border-blue-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                <span className="font-semibold">BC</span>
                            </div>
                            {sidebarOpen && (
                                <div className="ml-3">
                                    <p className="text-sm font-medium">Binh Chan</p>
                                    <p className="text-xs text-blue-200">Administrator</p>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center space-x-4">
                            {sidebarOpen && (
                                <button
                                    title="Return to the Home page"
                                    onClick={handleLogout}
                                    className="p-2 rounded-md hover:bg-blue-700"
                                >
                                    <LogOut size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                {renderContent()}
            </div>
        </div>
    );
}