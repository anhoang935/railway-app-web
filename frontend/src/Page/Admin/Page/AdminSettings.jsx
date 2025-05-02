import React, { useState, useEffect } from 'react';
import {
    Bell, Shield, Globe, Users, Database, Sliders, ChevronDown,
    RefreshCw, Save, Clock, PieChart, HelpCircle,
    Mail, MessageSquare, BarChart2, AlertTriangle, Moon, Sun
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import ControlledToggleButton from '../../../ui/CustomButtons/ControlledToggleButton';

const AdminSettings = ({ setActiveTab }) => {
    const { darkMode, setDarkMode } = useTheme();
    const [activeSection, setActiveSection] = useState('general');
    const [formValues, setFormValues] = useState({
        systemName: "BinhChan's Railway Management System",
        language: 'english',
        timeZone: 'UTC+0',
        darkMode: darkMode,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        maintenanceMode: false,
        delayThreshold: 5,
        backupFrequency: 'daily',
        dataRetention: 90,
        passwordExpiry: 30,
        accountLockout: 5,
        auditLogging: true,
        twoFactorAuth: false
    });

    useEffect(() => {
        setFormValues(prev => ({ ...prev, darkMode }));
    }, [darkMode]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setFormValues({
            ...formValues,
            [name]: newValue
        });

        if (name === 'darkMode') {
            setDarkMode(checked);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Settings saved:', formValues);
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'general':
                return (
                    <div className="space-y-6">
                        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            General Settings
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    System Name
                                </label>
                                <input
                                    type="text"
                                    name="systemName"
                                    value={formValues.systemName}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-[42px] transition-colors duration-300 ease-in-out ${darkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'border-gray-300'
                                        }`}
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-medium ${darkMode ? 'dark:text-gray-200' : 'text-gray-700'}`}>
                                    Language
                                </label>
                                <div className="relative">
                                    <select
                                        name="language"
                                        value={formValues.language}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-[42px] appearance-none pr-10 transition-colors duration-300 ease-in-out ${darkMode ? 'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="english">English</option>
                                        <option value="french">French</option>
                                        <option value="german">German</option>
                                        <option value="spanish">Spanish</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 mt-1">
                                        <ChevronDown className={`h-4 w-4 ${darkMode ? 'dark:text-gray-400' : 'text-gray-500'}`} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className={`block text-sm font-medium ${darkMode ? 'dark:text-gray-200' : 'text-gray-700'}`}>
                                    Time Zone
                                </label>
                                <div className="relative">
                                    <select
                                        name="timeZone"
                                        value={formValues.timeZone}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-[42px] appearance-none pr-10 transition-colors duration-300 ease-in-out ${darkMode ? 'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="UTC-12">UTC-12:00</option>
                                        <option value="UTC-8">UTC-08:00</option>
                                        <option value="UTC-5">UTC-05:00</option>
                                        <option value="UTC+0">UTC+00:00</option>
                                        <option value="UTC+1">UTC+01:00</option>
                                        <option value="UTC+2">UTC+02:00</option>
                                        <option value="UTC+5.5">UTC+05:30</option>
                                        <option value="UTC+8">UTC+08:00</option>
                                        <option value="UTC+10">UTC+10:00</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 mt-1">
                                        <ChevronDown className={`h-4 w-4 ${darkMode ? 'dark:text-gray-400' : 'text-gray-500'}`} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium ${darkMode ? 'dark:text-gray-200' : 'text-gray-700'} mb-2`}>
                                System Maintenance
                            </label>
                            <div className="flex items-center space-x-3">
                                <input
                                    id="maintenanceMode"
                                    name="maintenanceMode"
                                    type="checkbox"
                                    checked={formValues.maintenanceMode}
                                    onChange={handleInputChange}
                                    className={`h-4 w-4 text-blue-600 rounded ${darkMode ? 'dark:bg-gray-800 dark:border-gray-600' : ''
                                        }`}
                                />
                                <label htmlFor="maintenanceMode" className={`text-sm font-medium ${darkMode ? 'dark:text-gray-200' : 'text-gray-700'}`}>
                                    Activate Maintenance Mode
                                </label>
                            </div>
                            <p className={`mt-1 text-sm ${darkMode ? 'dark:text-gray-400' : 'text-gray-500'}`}>
                                Enabling maintenance mode will make the system inaccessible for non-admin users.
                            </p>
                        </div>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="space-y-6">
                        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Notification Settings
                        </h3>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <input
                                        id="emailNotifications"
                                        name="emailNotifications"
                                        type="checkbox"
                                        checked={formValues.emailNotifications}
                                        onChange={handleInputChange}
                                        className={`h-4 w-4 text-blue-600 rounded ${darkMode ? 'dark:bg-gray-800 dark:border-gray-600' : ''}`}
                                    />
                                    <label htmlFor="emailNotifications" className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Email Notifications
                                    </label>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <input
                                        id="smsNotifications"
                                        name="smsNotifications"
                                        type="checkbox"
                                        checked={formValues.smsNotifications}
                                        onChange={handleInputChange}
                                        className={`h-4 w-4 text-blue-600 rounded ${darkMode ? 'dark:bg-gray-800 dark:border-gray-600' : ''}`}
                                    />
                                    <label htmlFor="smsNotifications" className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        SMS Notifications
                                    </label>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <input
                                        id="pushNotifications"
                                        name="pushNotifications"
                                        type="checkbox"
                                        checked={formValues.pushNotifications}
                                        onChange={handleInputChange}
                                        className={`h-4 w-4 text-blue-600 rounded ${darkMode ? 'dark:bg-gray-800 dark:border-gray-600' : ''}`}
                                    />
                                    <label htmlFor="pushNotifications" className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Push Notifications
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Delay Threshold (minutes)
                                </label>
                                <input
                                    type="number"
                                    name="delayThreshold"
                                    value={formValues.delayThreshold}
                                    onChange={handleInputChange}
                                    min="0"
                                    className={`mt-1 block w-40 border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-[42px] transition-colors duration-300 ease-in-out ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                                />
                                <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Notify users when a train is delayed beyond this threshold.
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 'security':
                return (
                    <div className="space-y-6">
                        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Security Settings
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Password Expiry (days)
                                </label>
                                <input
                                    type="number"
                                    name="passwordExpiry"
                                    value={formValues.passwordExpiry}
                                    onChange={handleInputChange}
                                    min="0"
                                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-[42px] transition-colors duration-300 ease-in-out ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                                />
                                <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Set to 0 for never expire
                                </p>
                            </div>

                            <div>
                                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Account Lockout Attempts
                                </label>
                                <input
                                    type="number"
                                    name="accountLockout"
                                    value={formValues.accountLockout}
                                    onChange={handleInputChange}
                                    min="1"
                                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-[42px] transition-colors duration-300 ease-in-out ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                                />
                            </div>

                            <div className="flex items-center space-x-3">
                                <input
                                    id="auditLogging"
                                    name="auditLogging"
                                    type="checkbox"
                                    checked={formValues.auditLogging}
                                    onChange={handleInputChange}
                                    className={`h-4 w-4 text-blue-600 rounded ${darkMode ? 'dark:bg-gray-800 dark:border-gray-600' : ''}`}
                                />
                                <label htmlFor="auditLogging" className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Enable Audit Logging
                                </label>
                            </div>

                            <div className="flex items-center space-x-3">
                                <input
                                    id="twoFactorAuth"
                                    name="twoFactorAuth"
                                    type="checkbox"
                                    checked={formValues.twoFactorAuth}
                                    onChange={handleInputChange}
                                    className={`h-4 w-4 text-blue-600 rounded ${darkMode ? 'dark:bg-gray-800 dark:border-gray-600' : ''}`}
                                />
                                <label htmlFor="twoFactorAuth" className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Require Two Factor Authentication
                                </label>
                            </div>
                        </div>
                    </div>
                );

            case 'data':
                return (
                    <div className="space-y-6">
                        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Data Management
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Backup Frequency
                                </label>
                                <select
                                    name="backupFrequency"
                                    value={formValues.backupFrequency}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-[42px] appearance-none pr-10 transition-colors duration-300 ease-in-out ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                                >
                                    <option value="hourly">Hourly</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 mt-1">
                                    <ChevronDown className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                </div>
                            </div>

                            <div>
                                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Data Retention (days)
                                </label>
                                <input
                                    type="number"
                                    name="dataRetention"
                                    value={formValues.dataRetention}
                                    onChange={handleInputChange}
                                    min="1"
                                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-[42px] transition-colors duration-300 ease-in-out ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                                />
                                <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Historical data will be archived after this many days
                                </p>
                            </div>
                        </div>

                        <div className="pt-5">
                            <button
                                type="button"
                                className={`py-2 px-4 border rounded-md shadow-sm text-sm font-medium ${darkMode ? 'bg-red-800 text-white hover:bg-red-700 border-red-900' : 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                            >
                                <RefreshCw className="mr-2 h-4 w-4 inline" />
                                Run Manual Backup
                            </button>
                        </div>
                    </div>
                );

            case 'help':
                return (
                    <div className="space-y-6">
                        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Help & Documentation
                        </h3>

                        <div className={`bg-${darkMode ? 'gray-800' : 'gray-50'} p-4 rounded-lg transition-colors duration-300 ease-in-out`}>
                            <h4 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'} mb-2`}>
                                System Documentation
                            </h4>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                                Access comprehensive documentation about system features and how to use them.
                            </p>
                            <button
                                type="button"
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                View Documentation
                            </button>
                        </div>

                        <div className={`bg-${darkMode ? 'gray-800' : 'gray-50'} p-4 rounded-lg transition-colors duration-300 ease-in-out`}>
                            <h4 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'} mb-2`}>
                                Support & Contact
                            </h4>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                                Need help? Contact our support team for assistance with any issues.
                            </p>
                            <button
                                type="button"
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Contact Support
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className={`flex-1 flex flex-col overflow-hidden transition-colors duration-300 ease-in-out ${darkMode ? 'dark:bg-gray-900' : 'bg-gray-100'}`}>
            <header className={`transition-colors duration-300 ease-in-out ${darkMode ? 'dark:bg-gray-800 dark:border-gray-700' : 'bg-white'} shadow-sm`}>
                <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <h1 className={`text-lg font-medium transition-colors duration-300 ease-in-out ${darkMode ? 'dark:text-white' : 'text-gray-900'}`}>Admin Settings</h1>

                    <ControlledToggleButton
                        checked={!darkMode}
                        onChange={() => setDarkMode(!darkMode)}
                        style={{ cursor: 'pointer' }}
                    />
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                <aside className="hidden md:flex md:flex-shrink-0">
                    <div className={`w-64 flex flex-col border-r transition-colors duration-300 ease-in-out ${darkMode
                        ? 'dark:bg-gray-800 dark:border-gray-700'
                        : 'bg-white border-gray-200'
                        }`}>
                        <nav className="flex-1 p-4 space-y-1">
                            <button
                                onClick={() => setActiveSection('general')}
                                className={`flex items-center px-4 py-3 text-sm rounded-lg w-full transition-colors duration-300 ease-in-out ${activeSection === 'general'
                                    ? darkMode
                                        ? 'bg-blue-900 text-blue-100 font-bold'
                                        : 'bg-blue-50 text-blue-700 font-bold'
                                    : darkMode
                                        ? 'text-gray-300 hover:bg-gray-700 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50 font-medium'
                                    }`}
                            >
                                <Sliders className="mr-3 h-5 w-5" />
                                General
                            </button>

                            <button
                                onClick={() => setActiveSection('notifications')}
                                className={`flex items-center px-4 py-3 text-sm rounded-lg w-full transition-colors duration-300 ease-in-out ${activeSection === 'notifications'
                                    ? darkMode
                                        ? 'bg-blue-900 text-blue-100 font-bold'
                                        : 'bg-blue-50 text-blue-700 font-bold'
                                    : darkMode
                                        ? 'text-gray-300 hover:bg-gray-700 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50 font-medium'
                                    }`}
                            >
                                <Bell className="mr-3 h-5 w-5" />
                                Notifications
                            </button>

                            <button
                                onClick={() => setActiveSection('security')}
                                className={`flex items-center px-4 py-3 text-sm rounded-lg w-full transition-colors duration-300 ease-in-out ${activeSection === 'security'
                                    ? darkMode
                                        ? 'bg-blue-900 text-blue-100 font-bold'
                                        : 'bg-blue-50 text-blue-700 font-bold'
                                    : darkMode
                                        ? 'text-gray-300 hover:bg-gray-700 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50 font-medium'
                                    }`}
                            >
                                <Shield className="mr-3 h-5 w-5" />
                                Security
                            </button>

                            <button
                                onClick={() => setActiveSection('data')}
                                className={`flex items-center px-4 py-3 text-sm rounded-lg w-full transition-colors duration-300 ease-in-out ${activeSection === 'data'
                                    ? darkMode
                                        ? 'bg-blue-900 text-blue-100 font-bold'
                                        : 'bg-blue-50 text-blue-700 font-bold'
                                    : darkMode
                                        ? 'text-gray-300 hover:bg-gray-700 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50 font-medium'
                                    }`}
                            >
                                <Database className="mr-3 h-5 w-5" />
                                <span className="whitespace-normal text-left">Data Management</span>
                            </button>

                            <button
                                onClick={() => setActiveSection('help')}
                                className={`flex items-center px-4 py-3 text-sm rounded-lg w-full transition-colors duration-300 ease-in-out ${activeSection === 'help'
                                    ? darkMode
                                        ? 'bg-blue-900 text-blue-100 font-bold'
                                        : 'bg-blue-50 text-blue-700 font-bold'
                                    : darkMode
                                        ? 'text-gray-300 hover:bg-gray-700 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50 font-medium'
                                    }`}
                            >
                                <HelpCircle className="mr-3 h-5 w-5" />
                                <span className="whitespace-normal text-left">Help & Documentation</span>
                            </button>
                        </nav>
                    </div>
                </aside>

                <main className={`flex-1 overflow-y-auto p-6 transition-colors duration-300 ease-in-out ${darkMode ? 'dark:bg-gray-900' : ''
                    }`}>
                    <form onSubmit={handleSubmit} className="max-w-5xl">
                        <div className={`space-y-6 transition-colors duration-300 ease-in-out ${darkMode ? 'dark:text-gray-200' : ''}`}>
                            {renderSection()}
                        </div>

                        <div className={`mt-8 pt-5 border-t transition-colors duration-300 ease-in-out ${darkMode ? 'dark:border-gray-700' : 'border-gray-200'
                            } flex justify-end`}>
                            <button
                                type="button"
                                onClick={() => setActiveTab('dashboard')}
                                className={`py-2 px-4 border rounded-md shadow-sm text-sm font-medium ${darkMode
                                    ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3`}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                Save Settings
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default AdminSettings;