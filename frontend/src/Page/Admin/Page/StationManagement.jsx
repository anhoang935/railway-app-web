import React, { useState } from 'react';
import stationService from '../../../data/Service/stationService';
import { useLoadingWithTimeout } from '../../../hooks/useLoadingWithTimeout';
import { useAsyncData } from '../../../hooks/useAsyncData';
import LoadingPage from '../../../components/LoadingPage';
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from 'react-icons/fa';

const StationManagement = ({ setActiveTab }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        stationName: '',
    });

    const {
        data: stations,
        loading: dataLoading,
        error: dataError,
        refetch: refetchStations,
        setData: setStations
    } = useAsyncData(() => stationService.getAllStations());

    const {
        loading: operationLoading,
        error: operationError,
        setError: setOperationError,
        startLoading,
        stopLoading,
        setLoadingError
    } = useLoadingWithTimeout();

    // Show loading page during initial data fetch
    if (dataLoading) {
        return <LoadingPage message="Loading stations..." />;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }

    const handleAddNew = () => {
        setIsAdding(true);
        setEditingId(null);
        setFormData({
            stationName: '',
        });
        setOperationError(null);
    }

    const handleEdit = (station) => {
        setIsAdding(false);
        setEditingId(station.stationID);
        setFormData({
            stationName: station.stationName,
        });
        setOperationError(null);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({
            stationName: '',
        });
        setOperationError(null);
    }

    const validateForm = () => {
        console.log("Validating form data:", formData);
        if (!formData.stationName || formData.stationName.trim() === '') {
            setOperationError('Station name is required.');
            return false;
        }
        return true;
    }

    const handleSaveNew = async () => {
        try {
            if (!validateForm()) return;

            startLoading();

            const stationToCreate = {
                stationName: formData.stationName,
            }

            console.log("Creating station with data:", stationToCreate);

            await stationService.createStation(stationToCreate);

            // Refresh data to get updated list
            await refetchStations();

            setIsAdding(false);
            setFormData({
                stationName: '',
            });
            setOperationError(null);

            stopLoading();
        } catch (error) {
            setLoadingError('Failed to create station: ' + (error.toString() || 'Unknown error'));
            console.error(error);
        }
    }

    const handleUpdate = async () => {
        try {
            if (!validateForm()) return;

            startLoading();

            const stationToUpdate = {
                stationName: formData.stationName.trim(),
            }

            console.log("Updating station ID:", editingId, "with data:", stationToUpdate);

            await stationService.updateStation(editingId, stationToUpdate);

            // Refresh data to get updated list
            await refetchStations();

            setEditingId(null);
            setFormData({
                stationName: '',
            });
            setOperationError(null);

            stopLoading();
        } catch (error) {
            setLoadingError('Failed to update station: ' + (error.toString() || 'Unknown error'));
            console.error(error);
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this station?')) {
            try {
                startLoading();

                await stationService.deleteStation(id);

                // Refresh data to get updated list
                await refetchStations();

                setOperationError(null);
                stopLoading();
            } catch (error) {
                setLoadingError('Failed to delete station: ' + (error.toString() || 'Unknown error'));
                console.error(error);
            }
        }
    };

    // Combine both error states
    const currentError = dataError || operationError;

    return (
        <div className="p-4 h-screen flex flex-col station-management relative">
            {/* Only show operation loading overlay */}
            {operationLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="mt-2 text-sm text-gray-600">Processing...</p>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Station Management</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={refetchStations}
                        disabled={isAdding || editingId !== null || operationLoading}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Refresh stations"
                    >
                        Refresh
                    </button>
                    <button
                        onClick={handleAddNew}
                        disabled={isAdding || editingId !== null || operationLoading}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaPlus className="mr-2" /> Add New Station
                    </button>
                </div>
            </div>

            {/* Error message */}
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
                            onClick={() => {
                                setOperationError(null);
                                if (dataError) refetchStations();
                            }}
                            className="text-red-500 hover:text-red-700 font-bold text-lg"
                            title="Dismiss error"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Data status info */}
            <div className="mb-4 text-sm text-gray-600">
                <p>
                    <strong>Stations:</strong> {stations?.length || 0} |
                    <strong> Last updated:</strong> {new Date().toLocaleTimeString()}
                </p>
            </div>

            {/* Scrollable table container with fixed height */}
            <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
                <table className="min-w-full bg-white">
                    <thead className="sticky top-0 bg-gray-50 z-10">
                        <tr>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Station ID</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Station Name</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-center">Actions</th>
                        </tr>
                        {isAdding && (
                            <tr className="bg-blue-50 sticky top-[41px] z-10">
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <span className="text-gray-500 italic">Auto-generated</span>
                                </td>
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <input
                                        type='text'
                                        name='stationName'
                                        value={formData.stationName}
                                        onChange={handleChange}
                                        disabled={operationLoading}
                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                        placeholder="Station Name"
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
                        {stations && stations.length > 0 ? (
                            stations.map((station) => (
                                <tr key={station.stationID} className={editingId === station.stationID ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                                    <td className="px-4 py-2 border-b border-gray-200 font-bold">
                                        {station.stationID}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        {editingId === station.stationID ? (
                                            <input
                                                type="text"
                                                name="stationName"
                                                value={formData.stationName}
                                                onChange={handleChange}
                                                disabled={operationLoading}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                            />
                                        ) : (
                                            station.stationName
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        <div className="flex justify-center space-x-2">
                                            {editingId === station.stationID ? (
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
                                                        onClick={() => handleEdit(station)}
                                                        disabled={isAdding || editingId !== null || operationLoading}
                                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <FaEdit className="mr-1" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(station.stationID)}
                                                        disabled={isAdding || editingId !== null || operationLoading}
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
                                <td colSpan="3" className="px-4 py-8 border-b border-gray-200 text-center text-gray-500">
                                    No stations found. Add a new station to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StationManagement;