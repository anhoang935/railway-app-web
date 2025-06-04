import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSync, FaChartBar, FaTrain, FaCog, FaExclamationTriangle } from 'react-icons/fa';
import { useAsyncData } from "../../../hooks/useAsyncData";
import LoadingPage from "../../../components/LoadingPage";
import coachService from '../../../data/Service/coachService';
import coachTypeService from '../../../data/Service/coachTypeService';
import trainService from '../../../data/Service/trainService';

function CoachManagement() {
    // Your existing state variables...
    const [activeTab, setActiveTab] = useState('coaches');
    const [syncing, setSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState(null);
    const [currentError, setCurrentError] = useState(null);

    // Coach form states
    const [isAddingCoach, setIsAddingCoach] = useState(false);
    const [editingCoachId, setEditingCoachId] = useState(null);
    const [coachFormData, setCoachFormData] = useState({
        coachID: '',
        trainID: '',
        coach_typeID: ''
    });

    // Coach type form states
    const [isAddingCoachType, setIsAddingCoachType] = useState(false);
    const [editingCoachTypeId, setEditingCoachTypeId] = useState(null);
    const [coachTypeFormData, setCoachTypeFormData] = useState({
        coach_typeID: '',
        type: '',
        price: '',
        capacity: ''
    });

    // Data fetching hooks
    const {
        data: coaches,
        loading: coachesLoading,
        error: coachesError,
        refetch: refetchCoaches,
        setData: setCoaches
    } = useAsyncData(() => coachService.getAllCoaches());

    const {
        data: coachTypes,
        loading: coachTypesLoading,
        error: coachTypesError,
        refetch: refetchCoachTypes,
        setData: setCoachTypes
    } = useAsyncData(() => coachTypeService.getAllCoachTypes());

    const {
        data: trains,
        loading: trainsLoading,
        error: trainsError,
        refetch: refetchTrains,
        setData: setTrains
    } = useAsyncData(() => trainService.getAllTrains());

    // Remove the useLoadingWithTimeout hook and replace with simple state
    const [operationLoading, setOperationLoading] = useState(false);
    const [operationError, setOperationError] = useState(null);

    // Show loading page while any initial data loads
    const isInitialLoading = coachesLoading || coachTypesLoading || trainsLoading;

    if (isInitialLoading) {
        let loadingMessage = "Loading coach management...";
        if (coachesLoading) loadingMessage = "Loading coaches...";
        else if (coachTypesLoading) loadingMessage = "Loading coach types...";
        else if (trainsLoading) loadingMessage = "Loading trains...";

        return <LoadingPage message={loadingMessage} />;
    }

    // Combine error states - make sure currentError is properly set
    const combinedError = coachesError || coachTypesError || trainsError || operationError || currentError;
    const hasDataError = coachesError || coachTypesError || trainsError;

    // Handle refresh/retry functionality
    const handleRefreshData = async () => {
        try {
            setOperationLoading(true);

            // Refresh all data sources
            const refreshPromises = [];
            if (coachesError) refreshPromises.push(refetchCoaches());
            if (coachTypesError) refreshPromises.push(refetchCoachTypes());
            if (trainsError) refreshPromises.push(refetchTrains());

            // If no specific errors, refresh all
            if (!hasDataError) {
                refreshPromises.push(refetchCoaches(), refetchCoachTypes(), refetchTrains());
            }

            await Promise.all(refreshPromises);
            setOperationError(null);
            setCurrentError(null);

            setOperationLoading(false);
        } catch (error) {
            setOperationLoading(false);
            setCurrentError('Failed to refresh data: ' + error.toString());
        }
    };

    // Admin function to sync coach counts - FIX: Use startLoading instead of setOperationLoading
    const handleSyncCoachCounts = async () => {
        setSyncing(true);
        setSyncMessage({ type: 'info', text: 'Synchronization started in background...' });

        // Start sync in background without waiting
        coachService.syncAllCoachCounts()
            .then(() => {
                setSyncMessage({ type: 'success', text: 'Synchronization completed!' });
                // Refresh data after successful sync
                setTimeout(() => {
                    refetchCoaches().catch(console.error);
                }, 1000);
            })
            .catch(error => {
                console.error('Sync error:', error);
                setSyncMessage({ type: 'error', text: 'Sync failed. Please try again later.' });
            })
            .finally(() => {
                setSyncing(false);
                setTimeout(() => setSyncMessage(null), 8000);
            });
    };

    // Count coaches per train for admin dashboard
    const getCoachCountForTrain = (trainID) => {
        if (!coaches || !Array.isArray(coaches)) return 0;
        return coaches.filter(coach => coach.trainID === trainID).length;
    };

    // Check if train coach counts are out of sync
    const getOutOfSyncTrains = () => {
        if (!trains || !Array.isArray(trains) || !coaches || !Array.isArray(coaches)) return [];
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
        setOperationError(null);
        setCurrentError(null);
    };

    const handleEditCoach = (coach) => {
        setIsAddingCoach(false);
        setEditingCoachId(coach.coachID);
        setCoachFormData({
            coachID: coach.coachID,
            trainID: coach.trainID,
            coach_typeID: coach.coach_typeID
        });
        setOperationError(null);
        setCurrentError(null);
    };

    // Replace the existing handleSaveCoach with this optimistic version
    const handleSaveCoach = async () => {
        // Validation first
        if (!coachFormData.trainID || !coachFormData.coach_typeID) {
            setCurrentError('Please fill in all required fields');
            return;
        }

        setCurrentError(null);
        setOperationError(null);
        setOperationLoading(true);

        try {
            if (editingCoachId) {
                // Optimistic update - update UI immediately
                const optimisticCoach = {
                    coachID: editingCoachId,
                    trainID: coachFormData.trainID,
                    coach_typeID: coachFormData.coach_typeID,
                    trainName: getTrainName(coachFormData.trainID),
                    coach_type_name: getCoachTypeName(coachFormData.coach_typeID)
                };

                setCoaches(prev => 
                    prev.map(coach => 
                        coach.coachID === editingCoachId ? optimisticCoach : coach
                    )
                );

                setSyncMessage({ type: 'success', text: 'Coach updated! Processing in background...' });

                // Background update (fire and forget)
                coachService.updateCoach(editingCoachId, {
                    trainID: coachFormData.trainID,
                    coach_typeID: coachFormData.coach_typeID
                }).catch(error => {
                    console.error('Background update failed:', error);
                    // Revert optimistic update on failure
                    refetchCoaches();
                    setSyncMessage({ type: 'error', text: 'Update failed. Data refreshed.' });
                });

            } else {
                // For create, generate a temporary ID
                const tempId = `temp_${Date.now()}`;
                const optimisticCoach = {
                    coachID: tempId,
                    trainID: coachFormData.trainID,
                    coach_typeID: coachFormData.coach_typeID,
                    trainName: getTrainName(coachFormData.trainID),
                    coach_type_name: getCoachTypeName(coachFormData.coach_typeID),
                    isTemporary: true
                };

                // Add to UI immediately
                setCoaches(prev => [...prev, optimisticCoach]);
                setSyncMessage({ type: 'success', text: 'Coach created! Processing in background...' });

                // Background create (fire and forget)
                coachService.createCoach({
                    trainID: coachFormData.trainID,
                    coach_typeID: coachFormData.coach_typeID
                }).then(newCoach => {
                    // Replace temporary coach with real one
                    setCoaches(prev => 
                        prev.map(coach => 
                            coach.coachID === tempId ? newCoach : coach
                        )
                    );
                    setSyncMessage({ type: 'success', text: 'Coach created successfully!' });
                }).catch(error => {
                    console.error('Background create failed:', error);
                    // Remove temporary coach on failure
                    setCoaches(prev => prev.filter(coach => coach.coachID !== tempId));
                    setSyncMessage({ type: 'error', text: 'Create failed. Please try again.' });
                });
            }

            // Reset form immediately
            handleCancelCoach();

        } catch (error) {
            // This should rarely happen now
            console.error('Optimistic update error:', error);
            setCurrentError('Operation failed. Please try again.');
        } finally {
            setOperationLoading(false);
            setTimeout(() => setSyncMessage(null), 5000);
        }
    };

    const handleDeleteCoach = async (coachId) => {
        if (window.confirm('Are you sure you want to delete this coach?')) {
            // Optimistic delete - remove from UI immediately
            const originalCoaches = [...coaches];
            setCoaches(prev => prev.filter(coach => coach.coachID !== coachId));
            setSyncMessage({ type: 'success', text: 'Coach deleted! Processing...' });

            // Background delete
            coachService.deleteCoach(coachId)
                .then(() => {
                    setSyncMessage({ type: 'success', text: 'Coach deleted successfully!' });
                })
                .catch(error => {
                    console.error('Delete failed:', error);
                    // Restore coaches on failure
                    setCoaches(originalCoaches);
                    setSyncMessage({ type: 'error', text: 'Delete failed. Data restored.' });
                })
                .finally(() => {
                    setTimeout(() => setSyncMessage(null), 3000);
                });
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
        setOperationError(null);
        setCurrentError(null);
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
        setOperationError(null);
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
        setOperationError(null);
    };

    const handleSaveCoachType = async () => {
        try {
            setOperationLoading(true);

            if (!coachTypeFormData.coach_typeID?.trim() || !coachTypeFormData.type?.trim() || !coachTypeFormData.price) {
                setOperationError('Please fill in all required fields');
                return;
            }

            if (isAddingCoachType) {
                const newCoachType = await coachTypeService.createCoachType(coachTypeFormData);
                // Optimistic update
                setCoachTypes(prev => [...(prev || []), newCoachType]);
            } else {
                const updatedCoachType = await coachTypeService.updateCoachType(editingCoachTypeId, coachTypeFormData);
                // Optimistic update
                setCoachTypes(prev =>
                    (prev || []).map(coachType =>
                        coachType.coach_typeID === editingCoachTypeId ? updatedCoachType : coachType
                    )
                );
            }

            handleCancelCoachType();

            setSyncMessage({
                type: 'success',
                text: isAddingCoachType ? 'Coach type added successfully!' : 'Coach type updated successfully!'
            });
            setTimeout(() => setSyncMessage(null), 3000);

            setOperationLoading(false);

        } catch (err) {
            setOperationLoading(false);
            setOperationError('Failed to save coach type: ' + err.toString());
            // Refresh data on error to ensure consistency
            await refetchCoachTypes();
        }
    };

    const handleDeleteCoachType = async (coachTypeId) => {
        if (window.confirm('Are you sure you want to delete this coach type?')) {
            try {
                setOperationLoading(true);

                await coachTypeService.deleteCoachType(coachTypeId);

                // Optimistic update
                setCoachTypes(prevCoachTypes => prevCoachTypes.filter(coachType => coachType.coach_typeID !== coachTypeId));

                setSyncMessage({
                    type: 'success',
                    text: 'Coach type deleted successfully!'
                });
                setTimeout(() => setSyncMessage(null), 3000);

                setOperationLoading(false);
            } catch (err) {
                setOperationLoading(false);
                setOperationError('Failed to delete coach type: ' + err.toString());
                // Refresh data on error to ensure consistency
                await refetchCoachTypes();
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
        setOperationError(null);
    };

    const getTrainName = (trainID) => {
        if (!trains || !Array.isArray(trains)) return 'Unknown';
        const train = trains.find(t => t.trainID === trainID);
        return train ? train.trainName : 'Unknown';
    };

    const getCoachTypeName = (coach_typeID) => {
        if (!coachTypes || !Array.isArray(coachTypes)) return 'Unknown';
        const coachType = coachTypes.find(ct => ct.coach_typeID === coach_typeID);
        return coachType ? coachType.type : 'Unknown';
    };

    const outOfSyncTrains = getOutOfSyncTrains();

    return (
        <div className="p-4 h-screen flex flex-col coach-management relative">
            {/* Only show operation loading overlay */}
            {operationLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="mt-2 text-sm text-gray-600">Processing...</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Coach Management</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={handleRefreshData}
                        disabled={operationLoading}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Refresh all data"
                    >
                        Refresh
                    </button>
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'overview'
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-gray-200 text-gray-700 font-medium hover:bg-gray-300'
                            }`}
                    >
                        <FaChartBar className="inline mr-2" />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('coaches')}
                        className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'coaches'
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-gray-200 text-gray-700 font-medium hover:bg-gray-300'
                            }`}
                    >
                        <FaTrain className="inline mr-2" />
                        Coaches
                    </button>
                    <button
                        onClick={() => setActiveTab('coach-types')}
                        className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'coach-types'
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-gray-200 text-gray-700 font-medium hover:bg-gray-300'
                            }`}
                    >
                        <FaCog className="inline mr-2" />
                        Coach Types
                    </button>
                </div>
            </div>

            {/* Error message */}
            {combinedError && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-medium">
                                {hasDataError ? 'Data Loading Error' : 'Operation Error'}
                            </p>
                            <p className="mt-1">{combinedError}</p>
                        </div>
                        <button
                            onClick={() => {
                                setOperationError(null);
                                setCurrentError(null);
                                if (hasDataError) handleRefreshData();
                            }}
                            className="text-red-500 hover:text-red-700 font-bold text-lg"
                            title="Dismiss error"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Success message */}
            {syncMessage && (
                <div className={`border-l-4 p-4 mb-4 ${syncMessage.type === 'success'
                    ? 'bg-green-100 border-green-500 text-green-700'
                    : 'bg-red-100 border-red-500 text-red-700'
                    }`} role="alert">
                    <p>{syncMessage.text}</p>
                </div>
            )}

            {/* Data status info */}
            <div className="mb-4 text-sm text-gray-600">
                <p>
                    <strong> Last updated:</strong> {new Date().toLocaleTimeString()}
                </p>
            </div>

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
                        <h2 className="text-xl font-bold">Administrative Overview</h2>
                        <button
                            onClick={handleSyncCoachCounts}
                            disabled={syncing || operationLoading}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Synchronize coach counts in the train database"
                        >
                            <FaSync className={`mr-2 ${syncing ? 'animate-spin' : ''}`} />
                            {syncing ? 'Syncing...' : 'Sync Coach Counts'}
                        </button>
                    </div>

                    {/* Train Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                        {trains && trains.length > 0 ? trains.map(train => {
                            const actualCount = getCoachCountForTrain(train.trainID);
                            const registeredCount = train.coachTotal || 0;
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
                        }) : (
                            <div className="col-span-full text-center text-gray-500 py-8">
                                No trains available. Please check your data connection.
                            </div>
                        )}
                    </div>

                    {/* Summary Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                            <h4 className="text-lg font-semibold text-blue-800 mb-2">Total Trains</h4>
                            <p className="text-3xl font-bold text-blue-600">{trains?.length || 0}</p>
                        </div>
                        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                            <h4 className="text-lg font-semibold text-green-800 mb-2">Total Coaches</h4>
                            <p className="text-3xl font-bold text-green-600">{coaches?.length || 0}</p>
                        </div>
                        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                            <h4 className="text-lg font-semibold text-purple-800 mb-2">Coach Types</h4>
                            <p className="text-3xl font-bold text-purple-600">{coachTypes?.length || 0}</p>
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
                        <h2 className="text-xl font-bold">Coaches</h2>
                        <button
                            onClick={handleAddNewCoach}
                            disabled={isAddingCoach || editingCoachId !== null || operationLoading}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaPlus className="mr-2" /> Add New Coach
                        </button>
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
                                            <span className="text-gray-500 italic">Auto-generated</span>
                                        </td>
                                        <td className="px-4 py-2 border-b border-gray-200">
                                            <select
                                                name="trainID"
                                                value={coachFormData.trainID}
                                                onChange={handleCoachChange}
                                                disabled={operationLoading}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                            >
                                                <option value="">Select Train</option>
                                                {trains && trains.map(train => (
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
                                                disabled={operationLoading}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                            >
                                                <option value="">Select Coach Type</option>
                                                {coachTypes && coachTypes.map(coachType => (
                                                    <option key={coachType.coach_typeID} value={coachType.coach_typeID}>
                                                        {coachType.type}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-2 border-b border-gray-200 text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    onClick={handleSaveCoach}
                                                    disabled={operationLoading}
                                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50"
                                                >
                                                    <FaSave className="mr-1" /> {operationLoading ? 'Saving...' : 'Save'}
                                                </button>
                                                <button
                                                    onClick={handleCancelCoach}
                                                    disabled={operationLoading}
                                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50"
                                                >
                                                    <FaTimes className="mr-1" /> Cancel
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </thead>
                            <tbody>
                                {coaches && coaches.length > 0 ? (
                                    coaches.map((coach) => (
                                        <tr key={coach.coachID} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 border-b border-gray-200 font-bold">
                                                {editingCoachId === coach.coachID ? (
                                                    <input
                                                        type="text"
                                                        name="coachID"
                                                        value={coachFormData.coachID}
                                                        onChange={handleCoachChange}
                                                        disabled={operationLoading}
                                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
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
                                                        disabled={operationLoading}
                                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                    >
                                                        <option value="">Select Train</option>
                                                        {trains && trains.map(train => (
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
                                                        disabled={operationLoading}
                                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                    >
                                                        <option value="">Select Coach Type</option>
                                                        {coachTypes && coachTypes.map(coachType => (
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
                                                <div className="flex justify-center space-x-2">
                                                    {editingCoachId === coach.coachID ? (
                                                        <>
                                                            <button
                                                                onClick={handleSaveCoach}
                                                                disabled={operationLoading}
                                                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50"
                                                            >
                                                                <FaSave className="mr-1" /> {operationLoading ? 'Saving...' : 'Save'}
                                                            </button>
                                                            <button
                                                                onClick={handleCancelCoach}
                                                                disabled={operationLoading}
                                                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50"
                                                            >
                                                                <FaTimes className="mr-1" /> Cancel
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleEditCoach(coach)}
                                                                disabled={isAddingCoach || editingCoachId !== null || operationLoading}
                                                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <FaEdit className="mr-1" /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteCoach(coach.coachID)}
                                                                disabled={isAddingCoach || editingCoachId !== null || operationLoading}
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
                        <h2 className="text-xl font-bold">Coach Types</h2>
                        <button
                            onClick={handleAddNewCoachType}
                            disabled={isAddingCoachType || editingCoachTypeId !== null || operationLoading}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
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
                                                disabled={operationLoading}
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
                                                disabled={operationLoading}
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
                                                disabled={operationLoading}
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
                                                disabled={operationLoading}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                placeholder="Capacity"
                                                min="1"
                                            />
                                        </td>
                                        <td className="px-4 py-2 border-b border-gray-200 text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    onClick={handleSaveCoachType}
                                                    disabled={operationLoading}
                                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50"
                                                >
                                                    <FaSave className="mr-1" /> {operationLoading ? 'Saving...' : 'Save'}
                                                </button>
                                                <button
                                                    onClick={handleCancelCoachType}
                                                    disabled={operationLoading}
                                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50"
                                                >
                                                    <FaTimes className="mr-1" /> Cancel
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </thead>
                            <tbody>
                                {coachTypes && coachTypes.length > 0 ? (
                                    coachTypes.map((coachType) => (
                                        <tr key={coachType.coach_typeID} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 border-b border-gray-200 font-bold">
                                                {editingCoachTypeId === coachType.coach_typeID ? (
                                                    <input
                                                        type="text"
                                                        name="coach_typeID"
                                                        value={coachTypeFormData.coach_typeID}
                                                        onChange={handleCoachTypeChange}
                                                        disabled={operationLoading}
                                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
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
                                                        disabled={operationLoading}
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
                                                        disabled={operationLoading}
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
                                                        disabled={operationLoading}
                                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                        min="1"
                                                    />
                                                ) : (
                                                    coachType.capacity
                                                )}
                                            </td>
                                            <td className="px-4 py-2 border-b border-gray-200 text-center">
                                                <div className="flex justify-center space-x-2">
                                                    {editingCoachTypeId === coachType.coach_typeID ? (
                                                        <>
                                                            <button
                                                                onClick={handleSaveCoachType}
                                                                disabled={operationLoading}
                                                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50"
                                                            >
                                                                <FaSave className="mr-1" /> {operationLoading ? 'Saving...' : 'Save'}
                                                            </button>
                                                            <button
                                                                onClick={handleCancelCoachType}
                                                                disabled={operationLoading}
                                                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50"
                                                            >
                                                                <FaTimes className="mr-1" /> Cancel
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleEditCoachType(coachType)}
                                                                disabled={isAddingCoachType || editingCoachTypeId !== null || operationLoading}
                                                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <FaEdit className="mr-1" /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteCoachType(coachType.coach_typeID)}
                                                                disabled={isAddingCoachType || editingCoachTypeId !== null || operationLoading}
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