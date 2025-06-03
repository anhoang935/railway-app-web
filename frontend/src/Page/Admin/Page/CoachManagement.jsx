import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaTrain, FaCog, FaSync, FaExclamationTriangle, FaChartBar } from 'react-icons/fa';
import coachService from '../../../data/Service/coachService';
import coachTypeService from '../../../data/Service/coachTypeService';
import trainService from '../../../data/Service/trainService';
import './CoachManagement.css';

function CoachManagement() {
    const [activeTab, setActiveTab] = useState('coaches');
    const [coaches, setCoaches] = useState([]);
    const [coachTypes, setCoachTypes] = useState([]);
    const [trains, setTrains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [syncing, setSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState(null);

    // Coaches state
    const [isAddingCoach, setIsAddingCoach] = useState(false);
    const [editingCoachId, setEditingCoachId] = useState(null);
    const [coachFormData, setCoachFormData] = useState({
        coachID: '',
        trainID: '',
        coach_typeID: ''
    });

    // Coach Types state
    const [isAddingCoachType, setIsAddingCoachType] = useState(false);
    const [editingCoachTypeId, setEditingCoachTypeId] = useState(null);
    const [coachTypeFormData, setCoachTypeFormData] = useState({
        coach_typeID: '',
        type: '',
        price: '',
        capacity: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [coachesData, coachTypesData, trainsData] = await Promise.all([
                coachService.getAllCoaches(),
                coachTypeService.getAllCoachTypes(),
                trainService.getAllTrains()
            ]);

            setCoaches(coachesData);
            setCoachTypes(coachTypesData);
            setTrains(trainsData);
            setError(null);
        } catch (err) {
            setError('Failed to load data. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Admin function to sync coach counts
    const handleSyncCoachCounts = async () => {
        try {
            setSyncing(true);
            setSyncMessage(null);

            // Call the sync API endpoint
            const response = await coachService.syncAllCoachCounts();

            // Refresh data to show updated counts
            await fetchData();

            setSyncMessage({
                type: 'success',
                text: 'Coach counts have been synchronized successfully!'
            });

            // Clear message after 5 seconds
            setTimeout(() => setSyncMessage(null), 5000);

        } catch (err) {
            setError('Failed to sync coach counts: ' + err.toString());
            setSyncMessage({
                type: 'error',
                text: 'Failed to sync coach counts. Please try again.'
            });
            setTimeout(() => setSyncMessage(null), 5000);
        } finally {
            setSyncing(false);
        }
    };

    // Count coaches per train for admin dashboard
    const getCoachCountForTrain = (trainID) => {
        return coaches.filter(coach => coach.trainID === trainID).length;
    };

    // Check if train coach counts are out of sync
    const getOutOfSyncTrains = () => {
        return trains.filter(train => {
            const actualCount = getCoachCountForTrain(train.trainID);
            return actualCount !== train.coachTotal;
        });
    };

    // Coach management functions
    const handleCoachChange = (e) => {
        const { name, value } = e.target;
        setCoachFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddNewCoach = () => {
        setIsAddingCoach(true);
        setEditingCoachId(null);
        setCoachFormData({
            coachID: '',
            trainID: '',
            coach_typeID: ''
        });
    };

    const handleEditCoach = (coach) => {
        setIsAddingCoach(false);
        setEditingCoachId(coach.coachID);
        setCoachFormData({
            coachID: coach.coachID,
            trainID: coach.trainID,
            coach_typeID: coach.coach_typeID
        });
    };

    const handleSaveCoach = async () => {
        try {
            if (!coachFormData.coachID || !coachFormData.trainID || !coachFormData.coach_typeID) {
                setError('Please fill in all required fields');
                return;
            }

            if (isAddingCoach) {
                await coachService.createCoach(coachFormData);
            } else {
                await coachService.updateCoach(editingCoachId, coachFormData);
            }

            await fetchData(); // This will automatically show updated coach counts
            handleCancelCoach();
            setError(null);

            // Show success message
            setSyncMessage({
                type: 'success',
                text: isAddingCoach ? 'Coach added successfully!' : 'Coach updated successfully!'
            });
            setTimeout(() => setSyncMessage(null), 3000);

        } catch (err) {
            setError(err.toString());
        }
    };

    const handleDeleteCoach = async (coachId) => {
        if (window.confirm('Are you sure you want to delete this coach? This will automatically update the train\'s coach count.')) {
            try {
                await coachService.deleteCoach(coachId);
                await fetchData(); // This will automatically show updated coach counts
                setError(null);

                setSyncMessage({
                    type: 'success',
                    text: 'Coach deleted successfully!'
                });
                setTimeout(() => setSyncMessage(null), 3000);

            } catch (err) {
                setError(err.toString());
            }
        }
    };

    const handleCancelCoach = () => {
        setIsAddingCoach(false);
        setEditingCoachId(null);
        setCoachFormData({
            coachID: '',
            trainID: '',
            coach_typeID: ''
        });
    };

    // Coach Type management functions
    const handleCoachTypeChange = (e) => {
        const { name, value } = e.target;
        setCoachTypeFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddNewCoachType = () => {
        setIsAddingCoachType(true);
        setEditingCoachTypeId(null);
        setCoachTypeFormData({
            coach_typeID: '',
            type: '',
            price: '',
            capacity: ''
        });
    };

    const handleEditCoachType = (coachType) => {
        setIsAddingCoachType(false);
        setEditingCoachTypeId(coachType.coach_typeID);
        setCoachTypeFormData({
            coach_typeID: coachType.coach_typeID,
            type: coachType.type,
            price: coachType.price,
            capacity: coachType.capacity
        });
    };

    const handleSaveCoachType = async () => {
        try {
            if (!coachTypeFormData.coach_typeID || !coachTypeFormData.type || !coachTypeFormData.price) {
                setError('Please fill in all required fields');
                return;
            }

            if (isAddingCoachType) {
                await coachTypeService.createCoachType(coachTypeFormData);
            } else {
                await coachTypeService.updateCoachType(editingCoachTypeId, coachTypeFormData);
            }

            await fetchData();
            handleCancelCoachType();
            setError(null);
        } catch (err) {
            setError(err.toString());
        }
    };

    const handleDeleteCoachType = async (coachTypeId) => {
        if (window.confirm('Are you sure you want to delete this coach type?')) {
            try {
                await coachTypeService.deleteCoachType(coachTypeId);
                await fetchData();
                setError(null);
            } catch (err) {
                setError(err.toString());
            }
        }
    };

    const handleCancelCoachType = () => {
        setIsAddingCoachType(false);
        setEditingCoachTypeId(null);
        setCoachTypeFormData({
            coach_typeID: '',
            type: '',
            price: '',
            capacity: ''
        });
    };

    const getTrainName = (trainID) => {
        const train = trains.find(t => t.trainID === trainID);
        return train ? train.trainName : 'Unknown';
    };

    const getCoachTypeName = (coach_typeID) => {
        const coachType = coachTypes.find(ct => ct.coach_typeID === coach_typeID);
        return coachType ? coachType.type : 'Unknown';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const outOfSyncTrains = getOutOfSyncTrains();

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow p-6 coach-management">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Coach Management</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'overview'
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        <FaChartBar className="inline mr-2" />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('coaches')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'coaches'
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        <FaTrain className="inline mr-2" />
                        Coaches
                    </button>
                    <button
                        onClick={() => setActiveTab('coach-types')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'coach-types'
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        <FaCog className="inline mr-2" />
                        Coach Types
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                    <p>{error}</p>
                </div>
            )}

            {syncMessage && (
                <div className={`border-l-4 p-4 mb-4 ${syncMessage.type === 'success'
                    ? 'bg-green-100 border-green-500 text-green-700'
                    : 'bg-red-100 border-red-500 text-red-700'
                    }`} role="alert">
                    <p>{syncMessage.text}</p>
                </div>
            )}

            {/* Admin Alert - fixed height */}
            {outOfSyncTrains.length > 0 && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                    <div className="flex items-center">
                        <FaExclamationTriangle className="mr-2" />
                        <p className="font-medium">Data Synchronization Alert</p>
                    </div>
                    <p className="mt-1">
                        {outOfSyncTrains.length} train(s) have mismatched coach counts. Click "Sync Coach Counts" to update the database.
                    </p>
                </div>
            )}

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="overview-tab">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Administrative Overview</h2>
                        <button
                            onClick={handleSyncCoachCounts}
                            disabled={syncing}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center disabled:opacity-50"
                            title="Synchronize coach counts in the train database"
                        >
                            <FaSync className={`mr-2 ${syncing ? 'animate-spin' : ''}`} />
                            {syncing ? 'Syncing...' : 'Sync Coach Counts'}
                        </button>
                    </div>

                    {/* Train Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                        {trains.map(train => {
                            const actualCount = getCoachCountForTrain(train.trainID);
                            const registeredCount = train.coachTotal;
                            const isOutOfSync = actualCount !== registeredCount;

                            return (
                                <div
                                    key={train.trainID}
                                    className={`p-6 rounded-lg border-2 shadow-md transition-all hover:shadow-lg ${isOutOfSync
                                        ? 'border-red-400 bg-red-50'
                                        : 'border-green-400 bg-green-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-800">{train.trainName}</h3>
                                        <FaTrain className={`text-xl ${isOutOfSync ? 'text-red-500' : 'text-green-500'}`} />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Database:</span>
                                            <span className="font-medium">{registeredCount} coaches</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Actual:</span>
                                            <span className="font-medium">{actualCount} coaches</span>
                                        </div>
                                        {isOutOfSync && (
                                            <div className="mt-3 p-2 bg-red-100 rounded-md">
                                                <div className="flex items-center text-red-600 text-sm font-medium">
                                                    <FaExclamationTriangle className="mr-2" />
                                                    Needs synchronization
                                                </div>
                                            </div>
                                        )}
                                        {!isOutOfSync && (
                                            <div className="mt-3 p-2 bg-green-100 rounded-md">
                                                <div className="flex items-center text-green-600 text-sm font-medium">
                                                    ✓ Synchronized
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                            <h4 className="text-lg font-semibold text-blue-800 mb-2">Total Trains</h4>
                            <p className="text-3xl font-bold text-blue-600">{trains.length}</p>
                        </div>
                        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                            <h4 className="text-lg font-semibold text-green-800 mb-2">Total Coaches</h4>
                            <p className="text-3xl font-bold text-green-600">{coaches.length}</p>
                        </div>
                        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                            <h4 className="text-lg font-semibold text-purple-800 mb-2">Coach Types</h4>
                            <p className="text-3xl font-bold text-purple-600">{coachTypes.length}</p>
                        </div>
                    </div>

                    {/* Information Note */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <FaExclamationTriangle className="h-5 w-5 text-blue-400 mt-0.5" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">
                                    Data Synchronization Information
                                </h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <p>
                                        Coach counts are automatically updated when you add, edit, or delete coaches through the system.
                                        Use the "Sync Coach Counts" button if you notice any discrepancies or if coaches were modified directly in the database.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Coaches Tab */}
            {activeTab === 'coaches' && (
                <div className="coach-tab">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Coach Management</h2>
                        <div className="flex space-x-2">
                            <button
                                onClick={handleSyncCoachCounts}
                                disabled={syncing}
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center disabled:opacity-50"
                                title="Synchronize coach counts in the train database"
                            >
                                <FaSync className={`mr-2 ${syncing ? 'animate-spin' : ''}`} />
                                {syncing ? 'Syncing...' : 'Sync Coach Counts'}
                            </button>
                            <button
                                onClick={handleAddNewCoach}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
                                disabled={isAddingCoach}
                            >
                                <FaPlus className="mr-2" /> Add New Coach
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
                        <table className="min-w-full bg-white coach-table">
                            <thead className="sticky top-0 bg-gray-50 z-10">
                                <tr>
                                    <th className="px-4 py-2 border-b border-gray-200 text-left">Coach ID</th>
                                    <th className="px-4 py-2 border-b border-gray-200 text-left">Train</th>
                                    <th className="px-4 py-2 border-b border-gray-200 text-left">Coach Type</th>
                                    <th className="px-4 py-2 border-b border-gray-200 text-center">Actions</th>
                                </tr>
                                {isAddingCoach && (
                                    <tr className="bg-blue-50 sticky top-[41px] z-10">
                                        <td className="px-4 py-2 border-b border-gray-200">
                                            <input
                                                type="text"
                                                name="coachID"
                                                value={coachFormData.coachID}
                                                onChange={handleCoachChange}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                placeholder="Coach ID"
                                            />
                                        </td>
                                        <td className="px-4 py-2 border-b border-gray-200">
                                            <select
                                                name="trainID"
                                                value={coachFormData.trainID}
                                                onChange={handleCoachChange}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                            >
                                                <option value="">Select Train</option>
                                                {trains.map(train => (
                                                    <option key={train.trainID} value={train.trainID}>
                                                        {train.trainName}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-2 border-b border-gray-200">
                                            <select
                                                name="coach_typeID"
                                                value={coachFormData.coach_typeID}
                                                onChange={handleCoachChange}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                            >
                                                <option value="">Select Coach Type</option>
                                                {coachTypes.map(coachType => (
                                                    <option key={coachType.coach_typeID} value={coachType.coach_typeID}>
                                                        {coachType.type}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-2 border-b border-gray-200 text-center">
                                            <div className="action-buttons">
                                                <button
                                                    onClick={handleSaveCoach}
                                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded flex items-center"
                                                >
                                                    <FaSave className="mr-1" /> Save
                                                </button>
                                                <button
                                                    onClick={handleCancelCoach}
                                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded flex items-center"
                                                >
                                                    <FaTimes className="mr-1" /> Cancel
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </thead>
                            <tbody>
                                {coaches.length > 0 ? (
                                    coaches.map((coach) => (
                                        <tr key={coach.coachID} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 border-b border-gray-200">
                                                {editingCoachId === coach.coachID ? (
                                                    <input
                                                        type="text"
                                                        name="coachID"
                                                        value={coachFormData.coachID}
                                                        onChange={handleCoachChange}
                                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                        disabled
                                                    />
                                                ) : (
                                                    coach.coachID
                                                )}
                                            </td>
                                            <td className="px-4 py-2 border-b border-gray-200">
                                                {editingCoachId === coach.coachID ? (
                                                    <select
                                                        name="trainID"
                                                        value={coachFormData.trainID}
                                                        onChange={handleCoachChange}
                                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                    >
                                                        <option value="">Select Train</option>
                                                        {trains.map(train => (
                                                            <option key={train.trainID} value={train.trainID}>
                                                                {train.trainName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    getTrainName(coach.trainID)
                                                )}
                                            </td>
                                            <td className="px-4 py-2 border-b border-gray-200">
                                                {editingCoachId === coach.coachID ? (
                                                    <select
                                                        name="coach_typeID"
                                                        value={coachFormData.coach_typeID}
                                                        onChange={handleCoachChange}
                                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                    >
                                                        <option value="">Select Coach Type</option>
                                                        {coachTypes.map(coachType => (
                                                            <option key={coachType.coach_typeID} value={coachType.coach_typeID}>
                                                                {coachType.type}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    getCoachTypeName(coach.coach_typeID)
                                                )}
                                            </td>
                                            <td className="px-4 py-2 border-b border-gray-200 text-center">
                                                <div className="action-buttons">
                                                    {editingCoachId === coach.coachID ? (
                                                        <>
                                                            <button
                                                                onClick={handleSaveCoach}
                                                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded flex items-center"
                                                            >
                                                                <FaSave className="mr-1" /> Save
                                                            </button>
                                                            <button
                                                                onClick={handleCancelCoach}
                                                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded flex items-center"
                                                            >
                                                                <FaTimes className="mr-1" /> Cancel
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleEditCoach(coach)}
                                                                disabled={isAddingCoach || editingCoachId !== null}
                                                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <FaEdit className="mr-1" /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteCoach(coach.coachID)}
                                                                disabled={isAddingCoach || editingCoachId !== null}
                                                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <FaTrash className="mr-1" /> Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-8 border-b border-gray-200 text-center text-gray-500">
                                            No coaches found. Add a new coach to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Coach Types Tab */}
            {activeTab === 'coach-types' && (
                <div className="coach-type-tab">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Coach Types</h2>
                        <button
                            onClick={handleAddNewCoachType}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
                            disabled={isAddingCoachType}
                        >
                            <FaPlus className="mr-2" /> Add New Coach Type
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
                        <table className="min-w-full bg-white coach-type-table">
                            <thead className="sticky top-0 bg-gray-50 z-10">
                                <tr>
                                    <th className="px-4 py-2 border-b border-gray-200 text-left">Type ID</th>
                                    <th className="px-4 py-2 border-b border-gray-200 text-left">Type</th>
                                    <th className="px-4 py-2 border-b border-gray-200 text-left">Price (VND)</th>
                                    <th className="px-4 py-2 border-b border-gray-200 text-left">Capacity</th>
                                    <th className="px-4 py-2 border-b border-gray-200 text-center">Actions</th>
                                </tr>
                                {isAddingCoachType && (
                                    <tr className="bg-blue-50 sticky top-[41px] z-10">
                                        <td className="px-4 py-2 border-b border-gray-200">
                                            <input
                                                type="text"
                                                name="coach_typeID"
                                                value={coachTypeFormData.coach_typeID}
                                                onChange={handleCoachTypeChange}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                placeholder="Type ID"
                                            />
                                        </td>
                                        <td className="px-4 py-2 border-b border-gray-200">
                                            <input
                                                type="text"
                                                name="type"
                                                value={coachTypeFormData.type}
                                                onChange={handleCoachTypeChange}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                placeholder="Coach Type Name"
                                            />
                                        </td>
                                        <td className="px-4 py-2 border-b border-gray-200">
                                            <input
                                                type="number"
                                                name="price"
                                                value={coachTypeFormData.price}
                                                onChange={handleCoachTypeChange}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                placeholder="Price"
                                                min="0"
                                            />
                                        </td>
                                        <td className="px-4 py-2 border-b border-gray-200">
                                            <input
                                                type="number"
                                                name="capacity"
                                                value={coachTypeFormData.capacity}
                                                onChange={handleCoachTypeChange}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                placeholder="Capacity"
                                                min="1"
                                            />
                                        </td>
                                        <td className="px-4 py-2 border-b border-gray-200 text-center">
                                            <div className="action-buttons">
                                                <button
                                                    onClick={handleSaveCoachType}
                                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded flex items-center"
                                                >
                                                    <FaSave className="mr-1" /> Save
                                                </button>
                                                <button
                                                    onClick={handleCancelCoachType}
                                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded flex items-center"
                                                >
                                                    <FaTimes className="mr-1" /> Cancel
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </thead>
                            <tbody>
                                {coachTypes.length > 0 ? (
                                    coachTypes.map((coachType) => (
                                        <tr key={coachType.coach_typeID} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 border-b border-gray-200">
                                                {editingCoachTypeId === coachType.coach_typeID ? (
                                                    <input
                                                        type="text"
                                                        name="coach_typeID"
                                                        value={coachTypeFormData.coach_typeID}
                                                        onChange={handleCoachTypeChange}
                                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                        disabled
                                                    />
                                                ) : (
                                                    coachType.coach_typeID
                                                )}
                                            </td>
                                            <td className="px-4 py-2 border-b border-gray-200">
                                                {editingCoachTypeId === coachType.coach_typeID ? (
                                                    <input
                                                        type="text"
                                                        name="type"
                                                        value={coachTypeFormData.type}
                                                        onChange={handleCoachTypeChange}
                                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                    />
                                                ) : (
                                                    coachType.type
                                                )}
                                            </td>
                                            <td className="px-4 py-2 border-b border-gray-200">
                                                {editingCoachTypeId === coachType.coach_typeID ? (
                                                    <input
                                                        type="number"
                                                        name="price"
                                                        value={coachTypeFormData.price}
                                                        onChange={handleCoachTypeChange}
                                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                        min="0"
                                                    />
                                                ) : (
                                                    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(coachType.price)
                                                )}
                                            </td>
                                            <td className="px-4 py-2 border-b border-gray-200">
                                                {editingCoachTypeId === coachType.coach_typeID ? (
                                                    <input
                                                        type="number"
                                                        name="capacity"
                                                        value={coachTypeFormData.capacity}
                                                        onChange={handleCoachTypeChange}
                                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                        min="1"
                                                    />
                                                ) : (
                                                    coachType.capacity
                                                )}
                                            </td>
                                            <td className="px-4 py-2 border-b border-gray-200 text-center">
                                                <div className="action-buttons">
                                                    {editingCoachTypeId === coachType.coach_typeID ? (
                                                        <>
                                                            <button
                                                                onClick={handleSaveCoachType}
                                                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded flex items-center"
                                                            >
                                                                <FaSave className="mr-1" /> Save
                                                            </button>
                                                            <button
                                                                onClick={handleCancelCoachType}
                                                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded flex items-center"
                                                            >
                                                                <FaTimes className="mr-1" /> Cancel
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleEditCoachType(coachType)}
                                                                disabled={isAddingCoachType || editingCoachTypeId !== null}
                                                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <FaEdit className="mr-1" /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteCoachType(coachType.coach_typeID)}
                                                                disabled={isAddingCoachType || editingCoachTypeId !== null}
                                                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <FaTrash className="mr-1" /> Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 border-b border-gray-200 text-center text-gray-500">
                                            No coach types found. Add a new coach type to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CoachManagement;