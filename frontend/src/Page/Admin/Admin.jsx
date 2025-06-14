import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart3, Train, Users, Calendar, Settings, MapPin,
    LogOut, ArrowLeftToLine, Menu, ChevronDown, ChevronRight,
    Route, CreditCard, UserCheck, Ticket, User, Bus, Home, X
} from 'lucide-react';
import "./admin.css";

// Import your existing user service instead of useUser hook
import userService from '../../data/Service/userService';
import authService from '../../data/Service/authService';
import LoadingPage from '../../components/LoadingPage';

import Dashboard from './Page/Dashboard';
import TrainManagement from './Page/TrainManagement';
import StationManagement from './Page/StationManagement';
import JourneyManagement from './Page/JourneyManagement';
// import UsersManagement from './Page/UsersManagement';
import StaffUsers from './Page/CustomerManagement';
import StaffMembers from './Page/AdminManagement';
import Scheduling from './Page/Scheduling';
// import AdminSettings from './Page/AdminSettings';
import BookingManagement from './Page/BookingManagement';
import PassengerManagement from './Page/PassengerManagement';
import TrackManagement from './Page/TrackManagement';
import CoachManagement from './Page/CoachManagement';

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
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const navigate = useNavigate();

    // Replace useUser hook with state management for current user
    const [currentUser, setCurrentUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);
    const [authChecking, setAuthChecking] = useState(true); // Add auth checking state

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

    // Fetch current user data using your existing services
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                setUserLoading(true);
                setAuthChecking(true);

                // Check if user is authenticated and has admin role
                const userRole = localStorage.getItem('userRole');
                if (!authService.isAuthenticated() || userRole !== 'Admin') {
                    console.log('Access denied - not admin or not authenticated');
                    navigate('/login');
                    return;
                }

                // Get current user from auth service
                const authUser = authService.getCurrentUser();

                if (authUser && authUser.userId) {
                    // Fetch full user details from user service
                    const fullUserData = await userService.getUserByID(authUser.userId);
                    setCurrentUser(fullUserData);

                    // Double-check the user's role from the database
                    if (fullUserData.Role !== 'Admin') {
                        console.log('Access denied - user role is not Admin:', fullUserData.Role);
                        navigate('/home');
                        return;
                    }
                } else {
                    // Fallback: try to get user from localStorage
                    const userId = localStorage.getItem('userId');
                    if (userId) {
                        const userData = await userService.getUserByID(parseInt(userId));
                        setCurrentUser(userData);

                        // Check role from database
                        if (userData.Role !== 'Admin') {
                            console.log('Access denied - user role is not Admin:', userData.Role);
                            navigate('/home');
                            return;
                        }
                    } else {
                        // No user found, redirect to login
                        navigate('/login');
                        return;
                    }
                }
            } catch (error) {
                console.error('Error fetching current user:', error);
                // Redirect to login on error
                navigate('/login');
            } finally {
                setUserLoading(false);
                setAuthChecking(false);
            }
        };

        fetchCurrentUser();
    }, [navigate]);

    // Show loading page while checking authentication
    if (authChecking) {
        return <LoadingPage message="Verifying admin access..." />;
    }

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

    // Enhanced logout function with dialog
    const handleLogoutClick = () => {
        setShowLogoutDialog(true);
    };

    const handleLogout = () => {
        authService.logout(); // Clear auth tokens
        setShowLogoutDialog(false);
        navigate('/login');
    };

    const handleGoHome = () => {
        setShowLogoutDialog(false);
        navigate('/home');
    };

    const handleCancelLogout = () => {
        setShowLogoutDialog(false);
    };

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
            case "coaches":
                return <CoachManagement setActiveTab={setActiveTab} />;
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
            // case "settings":
            //     return <AdminSettings setActiveTab={setActiveTab} />;
            case "tracks":
                return <TrackManagement setActiveTab={setActiveTab} />;
            default:
                return <Dashboard />;
        }
    };

    // Helper function to get user initials
    const getUserInitials = (name) => {
        if (!name) return 'AD';
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-blue-900 text-white transition-all duration-300 flex flex-col`}>
                {/* Header section - fixed height */}
                <div className="flex-shrink-0 p-4 flex items-center justify-between">
                    {sidebarOpen ? (
                        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                    ) : (
                        <span></span>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-1 rounded-md hover:bg-blue-800"
                    >
                        {sidebarOpen ? <ArrowLeftToLine size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Navigation section - fills remaining space, no scrollbar */}
                <nav className="flex-1 min-h-0">
                    <div className="h-full overflow-y-auto scrollbar-hide">
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
                            icon={<Bus size={20} />}
                            label="Coaches"
                            active={activeTab === "coaches"}
                            expanded={sidebarOpen}
                            onClick={() => setActiveTab("coaches")}
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
                        {/* <div className="mt-4">
                            <NavItem
                                icon={<Settings size={20} />}
                                label="Settings"
                                active={activeTab === "settings"}
                                expanded={sidebarOpen}
                                onClick={() => setActiveTab("settings")}
                            />
                        </div> */}
                    </div>
                </nav>

                {/* Footer/User section - fixed height */}
                <div className="flex-shrink-0 p-4 border-t border-blue-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                <span className="font-semibold">
                                    {userLoading ? '...' : getUserInitials(currentUser?.UserName)}
                                </span>
                            </div>
                            {sidebarOpen && (
                                <div className="ml-3">
                                    <p className="text-sm font-medium">
                                        {userLoading ? 'Loading...' : (currentUser?.UserName || 'Admin User')}
                                    </p>
                                    <p className="text-xs text-blue-200">
                                        {currentUser?.Role || 'Administrator'}
                                    </p>
                                </div>
                            )}
                        </div>
                        {/* Only keep logout button */}
                        {sidebarOpen && (
                            <button
                                title="Log out"
                                onClick={handleLogoutClick}
                                className="p-2 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                <LogOut size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto">
                {renderContent()}
            </main>

            {/* Logout Confirmation Dialog */}
            {showLogoutDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                What would you like to do?
                            </h3>
                            <button
                                onClick={handleCancelLogout}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-gray-600 mb-6">
                            Choose whether to log out completely or return to the home page.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleGoHome}
                                className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                <Home size={18} className="mr-2" />
                                Go to Home Page
                            </button>

                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                <LogOut size={18} className="mr-2" />
                                Log Out Completely
                            </button>

                            <button
                                onClick={handleCancelLogout}
                                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}