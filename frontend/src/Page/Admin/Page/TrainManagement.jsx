import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import trainService from '../../../data/Service/trainService';
import { useLoadingWithTimeout } from '../../../hooks/useLoadingWithTimeout';
import { useAsyncData } from '../../../hooks/useAsyncData';
import LoadingPage from '../../../components/LoadingPage';

const TrainManagement = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        trainName: '',
        trainType: 'SE',
        coachTotal: ''
    });

    // Use useAsyncData for initial data fetching and management
    const {
        data: trains,
        loading: dataLoading,
        error: dataError,
        refetch: refetchTrains,
        setData: setTrains
    } = useAsyncData(() => trainService.getAllTrains());

    // Use useLoadingWithTimeout for operations (create, update, delete)
    const {
        loading: operationLoading,
        error: operationError,
        setError: setOperationError,
        startLoading,
        stopLoading,
        setLoadingError
    } = useLoadingWithTimeout();

    // Show blank loading page while initial data loads
    if (dataLoading) {
        return <LoadingPage message="Loading trains..." />;
    }

    // Combine both loading states
    const isLoading = dataLoading || operationLoading;
    const currentError = dataError || operationError;

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Fix for coachTotal handling
        if (name === 'coachTotal') {
            // Allow empty string during typing, but convert to number when not empty
            const newValue = value === '' ? '' : parseInt(value, 10);
            setFormData(prev => ({
                ...prev,
                [name]: newValue
            }));
        }
        else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Start adding a new train
    const handleAddNew = () => {
        setIsAdding(true);
        setEditingId(null);
        setFormData({
            trainName: '',
            trainType: 'SE',
            coachTotal: ''
        });
        // Clear any previous operation errors when starting new action
        setOperationError(null);
    };

    // Start editing a train
    const handleEdit = (train) => {
        setIsAdding(false);
        setEditingId(train.trainID);
        setFormData({
            trainName: train.trainName,
            trainType: train.trainType,
            coachTotal: train.coachTotal
        });
        // Clear any previous operation errors when starting edit
        setOperationError(null);
    };

    // Cancel adding/editing
    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({
            trainName: '',
            trainType: 'SE',
            coachTotal: ''
        });
        // Clear operation errors when canceling
        setOperationError(null);
    };

    // Validate form data
    const validateForm = () => {
        console.log("Validating form data:", formData);

        if (!formData.trainName || formData.trainName.trim() === '') {
            setOperationError('Please enter a train name');
            return false;
        }

        if (!formData.trainType) {
            setOperationError('Please select a train type');
            return false;
        }

        if (formData.coachTotal === '' ||
            formData.coachTotal === null ||
            formData.coachTotal === undefined ||
            isNaN(Number(formData.coachTotal))) {
            setOperationError('Please enter a valid number for coach total');
            return false;
        }

        return true;
    };

    // Save a new train
    const handleSaveNew = async () => {
        try {
            if (!validateForm()) return;

            startLoading(); // Use operation loading for this action

            const trainToCreate = {
                trainName: formData.trainName.trim(),
                trainType: formData.trainType,
                coachTotal: Number(formData.coachTotal)
            };

            console.log("Creating train with data:", trainToCreate);

            // Create the train
            const newTrain = await trainService.createTrain(trainToCreate);

            // Optimistic update: add to local state immediately
            if (newTrain) {
                setTrains(prevTrains => [...prevTrains, newTrain]);
            } else {
                // Fallback: refetch all data if creation response doesn't include the new train
                await refetchTrains();
            }

            // Reset form and states
            setIsAdding(false);
            setFormData({
                trainName: '',
                trainType: 'SE',
                coachTotal: ''
            });

            stopLoading(); // Stop operation loading on success
        }
        catch (err) {
            setLoadingError('Failed to create train: ' + (err.toString() || 'Unknown error'));
            console.error(err);
        }
    };

    // Update an existing train
    const handleUpdate = async () => {
        try {
            if (!validateForm()) return;

            startLoading();

            const trainToUpdate = {
                trainName: formData.trainName.trim(),
                trainType: formData.trainType,
                coachTotal: Number(formData.coachTotal)
            };

            console.log("Updating train ID:", editingId, "with data:", trainToUpdate);

            // Update the train
            await trainService.updateTrain(editingId, trainToUpdate);

            // Optimistic update: update local state immediately
            setTrains(prevTrains =>
                prevTrains.map(train =>
                    train.trainID === editingId
                        ? { ...train, ...trainToUpdate }
                        : train
                )
            );

            // Reset form and states
            setEditingId(null);
            setFormData({
                trainName: '',
                trainType: 'SE',
                coachTotal: ''
            });

            stopLoading();
        }
        catch (err) {
            setLoadingError('Failed to update train: ' + (err.toString() || 'Unknown error'));
            console.error(err);
        }
    };

    // Delete a train
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this train?')) {
            try {
                startLoading();

                await trainService.deleteTrain(id);

                // Optimistic update: remove from local state immediately
                setTrains(prevTrains => prevTrains.filter(train => train.trainID !== id));

                stopLoading();
            } catch (err) {
                setLoadingError('Failed to delete train: ' + (err.toString() || 'Unknown error'));
                console.error(err);
                // If delete failed, refetch to ensure data consistency
                await refetchTrains();
            }
        }
    };

    // Error dismissal handler
    const handleDismissError = () => {
        setOperationError(null);
        // For data errors, trigger a refetch
        if (dataError) {
            refetchTrains();
        }
    };

    return (
        <div className="p-4 h-screen flex flex-col train-management relative">
            {/* Only show operation loading overlay */}
            {operationLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="mt-2 text-sm text-gray-600">Processing...</p>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Train Management</h1>
                <div className="flex space-x-2">
                    {/* Refresh button */}
                    <button
                        onClick={refetchTrains}
                        disabled={isAdding || editingId || isLoading}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Refresh train data"
                    >
                        Refresh
                    </button>
                    <button
                        onClick={handleAddNew}
                        disabled={isAdding || editingId || isLoading}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaPlus className="mr-2" /> Add New Train
                    </button>
                </div>
            </div>

            {/* Error message - shows either data or operation errors */}
            {currentError && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-medium">
                                {dataError ? 'Data Loading Error' : 'Operation Error'}
                            </p>
                            <p className="mt-1">{currentError}</p>
                        </div>
                        <button
                            onClick={handleDismissError}
                            className="text-red-500 hover:text-red-700 font-bold text-lg"
                            title="Dismiss error"
                        >
                            ×
                        </button>
                    </div>
                    {/* {dataError && (
                        <button
                            onClick={refetchTrains}
                            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                        >
                            Retry Loading
                        </button>
                    )} */}
                </div>
            )}

            {/* Data loading status info */}
            <div className="mb-4 text-sm text-gray-600">
                <p>
                    <strong>Trains loaded:</strong> {trains.length} |
                    <strong> Status:</strong> {dataLoading ? 'Loading...' : 'Ready'} |
                    <strong> Last updated:</strong> {new Date().toLocaleTimeString()}
                </p>
            </div>

            {/* Scrollable table container with fixed height */}
            <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
                <table className="min-w-full bg-white">
                    <thead className="sticky top-0 bg-gray-50 z-10">
                        <tr>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Train ID</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Train Name</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Train Type</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Coach Total</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-center">Actions</th>
                        </tr>
                        {/* Add new train row - sticky below header */}
                        {isAdding && (
                            <tr className="bg-blue-50 sticky top-[41px] z-10">
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <span className="text-gray-500 italic">Auto-generated</span>
                                </td>
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <input
                                        type="text"
                                        name="trainName"
                                        value={formData.trainName}
                                        onChange={handleChange}
                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                        placeholder="Train Name"
                                        disabled={operationLoading}
                                    />
                                </td>
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <select
                                        name="trainType"
                                        value={formData.trainType}
                                        onChange={handleChange}
                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                        disabled={operationLoading}
                                    >
                                        <option value="SE">SE</option>
                                        <option value="TN">TN</option>
                                    </select>
                                </td>
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <input
                                        type="number"
                                        name="coachTotal"
                                        value={formData.coachTotal}
                                        onChange={handleChange}
                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                        placeholder="Coach Total"
                                        min="1"
                                        disabled={operationLoading}
                                    />
                                </td>
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <div className="flex justify-center space-x-2">
                                        <button
                                            onClick={handleSaveNew}
                                            disabled={operationLoading}
                                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50"
                                        >
                                            <FaSave className="mr-1" /> {operationLoading ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                            onClick={handleCancel}
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
                        {/* Train list rows */}
                        {trains.length > 0 ? (
                            trains.map((train) => (
                                <tr key={train.trainID} className={editingId === train.trainID ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                                    <td className="px-4 py-2 border-b border-gray-200 font-bold">
                                        {train.trainID}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        {editingId === train.trainID ? (
                                            <input
                                                type="text"
                                                name="trainName"
                                                value={formData.trainName}
                                                onChange={handleChange}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                disabled={operationLoading}
                                            />
                                        ) : (
                                            train.trainName
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        {editingId === train.trainID ? (
                                            <select
                                                name="trainType"
                                                value={formData.trainType}
                                                onChange={handleChange}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                disabled={operationLoading}
                                            >
                                                <option value="SE">SE</option>
                                                <option value="TN">TN</option>
                                            </select>
                                        ) : (
                                            train.trainType
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        {editingId === train.trainID ? (
                                            <input
                                                type="number"
                                                name="coachTotal"
                                                value={formData.coachTotal}
                                                onChange={handleChange}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                min="1"
                                                disabled={operationLoading}
                                            />
                                        ) : (
                                            train.coachTotal
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        <div className="flex justify-center space-x-2">
                                            {editingId === train.trainID ? (
                                                <>
                                                    <button
                                                        onClick={handleUpdate}
                                                        disabled={operationLoading}
                                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50"
                                                    >
                                                        <FaSave className="mr-1" /> {operationLoading ? 'Saving...' : 'Save'}
                                                    </button>
                                                    <button
                                                        onClick={handleCancel}
                                                        disabled={operationLoading}
                                                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50"
                                                    >
                                                        <FaTimes className="mr-1" /> Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(train)}
                                                        disabled={isAdding || editingId !== null || isLoading}
                                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <FaEdit className="mr-1" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(train.trainID)}
                                                        disabled={isAdding || editingId !== null || isLoading}
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
                                    {dataLoading ? 'Loading trains...' : 'No trains found. Add a new train to get started.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TrainManagement;