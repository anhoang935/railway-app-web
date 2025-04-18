import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import {
    BarChart3, Train, Users, Calendar, Settings, Bell, Search,
    Menu, X, ChevronDown, MapPin, RefreshCw, PlusCircle,
    AlertTriangle, TrendingUp, Clock, Filter, CheckCircle,
    Save, SlidersHorizontal, User, Mail, Phone, LogOut
} from 'lucide-react';
import "./admin.css"

// Sample data 
const recentAlerts = [
    { id: 1, type: 'Delay', station: 'Central Station', time: '10 mins ago', severity: 'medium' },
    { id: 2, type: 'Maintenance', station: 'North Terminal', time: '25 mins ago', severity: 'low' },
    { id: 3, type: 'Signal Failure', station: 'East Junction', time: '45 mins ago', severity: 'high' }
];

const trainStats = [
    { label: 'On Time', value: 85, color: 'bg-green-500' },
    { label: 'Delayed', value: 12, color: 'bg-yellow-500' },
    { label: 'Cancelled', value: 3, color: 'bg-red-500' }
];

const stationTraffic = [
    { id: 1, name: 'Central Station', passengers: 12500, trains: 145 },
    { id: 2, name: 'North Terminal', passengers: 8700, trains: 98 },
    { id: 3, name: 'East Junction', passengers: 6200, trains: 72 },
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

    const formattedDateTime = currentTime.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const sortedWidgets = [...dashboardLayout].sort((a, b) => a.order - b.order);

    return (
        <div className="flex h-screen bg-gray-100">
            <div
                className={`${sidebarOpen ? 'w-64' : 'w-20'} text-white transition-all duration-300 flex flex-col`}
                style={{
                    // background: 'linear-gradient(150deg, #1e3c72, #2a5298, #4f8a8b, #7b4f92, #1e3c72)',
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
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
                <nav className="mt-6 space-y-1 flex-1">
                    <NavItem icon={<BarChart3 size={20} />} label="Dashboard" active={activeTab === "dashboard"} expanded={sidebarOpen} onClick={() => setActiveTab("dashboard")} />
                    <NavItem icon={<Train size={20} />} label="Train Management" active={activeTab === "trains"} expanded={sidebarOpen} onClick={() => setActiveTab("trains")} />
                    <NavItem icon={<MapPin size={20} />} label="Stations" active={activeTab === "stations"} expanded={sidebarOpen} onClick={() => setActiveTab("stations")} />
                    <NavItem icon={<Users size={20} />} label="Users Management" active={activeTab === "users"} expanded={sidebarOpen} onClick={() => setActiveTab("users")} />
                    <NavItem icon={<Calendar size={20} />} label="Scheduling" active={activeTab === "scheduling"} expanded={sidebarOpen} onClick={() => setActiveTab("scheduling")} />
                    <NavItem icon={<Settings size={20} />} label="Settings" active={activeTab === "settings"} expanded={sidebarOpen} onClick={() => setActiveTab("settings")} />
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
                            <button
                                title="Return to the Home page"
                                onClick={handleLogout}
                                className="p-2 rounded-md hover:bg-blue-700"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                {activeTab === "dashboard" && (
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

                                {/* <div>
                                    {isEditing && (
                                        <button
                                            onClick={handleSaveChanges}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                        >
                                            <Save className="w-4 h-4" /> Save Changes
                                        </button>
                                    )}
                                    {!isEditing && (
                                        <button
                                            onClick={handleEditToggle}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Edit Dashboard
                                        </button>
                                    )}
                                </div> */}

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
                                                {widget.id === 'alerts' && <SystemAlertsWidget alerts={recentAlerts} />}
                                                {widget.id === 'trains' && <TrainStatusWidget stats={trainStats} />}
                                                {widget.id === 'stations' && <StationTrafficWidget stations={stationTraffic} />}
                                                {widget.id === 'maintenance' && <MaintenanceWidget maintenance={upcomingMaintenance} />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Notification
                            {showNotification && (
                                <div
                                    className={`mt-4 fixed bottom-8 right-8 transition-all duration-700 ease-in-out 
                              ${showNotification ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'} 
                              bg-green-100 text-green-800 px-4 py-3 rounded-lg shadow text-center`}
                                >
                                    Changes have been saved successfully ✅
                                </div> */}
                            {/* )} */}
                        </main>
                    </>
                )}

                {(activeTab !== "dashboard") && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center p-6 max-w-md">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                {activeTab === "trains" && "Train Management"}
                                {activeTab === "stations" && "Station Management"}
                                {activeTab === "users" && "Users Management"}
                                {activeTab === "scheduling" && "Train Scheduling"}
                                {activeTab === "settings" && "Admin Settings"}
                            </h2>
                            <p className="text-gray-600 mb-6">This section is currently under development. Please check back later.</p>
                            <button
                                onClick={() => setActiveTab("dashboard")}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function NavItem({ icon, label, active = false, expanded, onClick }) {
    return (
        <div
            className={`flex items-center px-4 py-2 cursor-pointer hover:bg-blue-700 ${active ? 'bg-blue-700' : ''
                }`}
            onClick={onClick}
        >
            <div className={`flex items-center ${expanded ? 'justify-start' : 'justify-center w-full'}`}>
                {icon}
            </div>
            {expanded && <span className="ml-3">{label}</span>}
        </div>
    );
}

function SystemAlertsWidget({ alerts }) {
    return (
        <div className="space-y-3">
            {alerts.map(alert => (
                <div
                    key={alert.id}
                    className={`
            flex items-center p-3 rounded-lg border
            ${alert.severity === 'high' ? 'border-red-200 bg-red-50' :
                            alert.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                                'border-blue-200 bg-blue-50'}
          `}
                >
                    <div className={`
            p-2 rounded-full
            ${alert.severity === 'high' ? 'bg-red-100' :
                            alert.severity === 'medium' ? 'bg-yellow-100' :
                                'bg-blue-100'}
          `}>
                        <AlertTriangle size={18} className={`
              ${alert.severity === 'high' ? 'text-red-600' :
                                alert.severity === 'medium' ? 'text-yellow-600' :
                                    'text-blue-600'}
            `} />
                    </div>
                    <div className="ml-3">
                        <p className="font-medium">{alert.type}</p>
                        <p className="text-sm text-gray-600">{alert.station} • {alert.time}</p>
                    </div>
                </div>
            ))}
            <button className="w-full py-2 text-center text-sm text-blue-600 hover:text-blue-800">
                View All Alerts
            </button>
        </div>
    );
}

function TrainStatusWidget({ stats }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-2xl font-semibold">{stats.reduce((acc, curr) => acc + curr.value, 0)}</p>
                    <p className="text-sm text-gray-500">Total trains in operation</p>
                </div>
                <div className="flex">
                    {stats.map((stat, index) => (
                        <div key={index} className="ml-3 flex items-center">
                            <div className={`w-3 h-3 rounded-full ${stat.color} mr-1`}></div>
                            <span className="text-sm">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="h-8 w-full flex rounded-full overflow-hidden">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className={`${stat.color}`}
                        style={{ width: `${stat.value}%` }}
                    ></div>
                ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">{stat.label}</span>
                            <div className={`w-2 h-2 rounded-full ${stat.color}`}></div>
                        </div>
                        <p className="text-2xl font-medium mt-1">{stat.value}%</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StationTrafficWidget({ stations }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Top Stations by Traffic</h4>
                <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
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
                            <span>{station.trains} trains today</span>
                            <span>Updated 5m ago</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function MaintenanceWidget({ maintenance }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Upcoming Maintenance</h4>
                <button className="text-sm text-blue-600 hover:text-blue-800">Schedule</button>
            </div>

            <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Line</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {maintenance.map(item => (
                            <tr key={item.id}>
                                <td className="px-4 py-3 text-sm">{item.line}</td>
                                <td className="px-4 py-3 text-sm">{item.section}</td>
                                <td className="px-4 py-3 text-sm">{item.date}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 text-xs rounded-full ${item.status === 'Scheduled' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}