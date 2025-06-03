import React, { useState, useEffect } from 'react';
import stationService from '../../../data/Service/stationService';
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from 'react-icons/fa';

const StationManagement = () => {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        stationName: '',
    });

    useEffect(() => {
        fetchStations();
    }, []);

    const fetchStations = async () => {
        try {
            setLoading(true);
            const data = await stationService.getAllStations();
            setStations(data);
            setError(null);
        } catch (error) {
            setError('Failed to load stations. Please try again later.');
            setError(error);
        } finally {
            setLoading(false);
        }
    };

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
    }

    const handleEdit = (station) => {
        setIsAdding(false);
        setEditingId(station.stationID);
        setFormData({
            stationName: station.stationName,
        });
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({
            stationName: '',
        });
    }

    const validateForm = () => {
        console.log("Validating form data:", formData);
        if (!formData.stationName || formData.stationName.trim() === '') {
            setError('Station name is required.');
            return false;
        }
        return true;
    }

    const handleSaveNew = async () => {
        try {
            if(!validateForm()) return;

            const stationToCreate = {
                stationName: formData.stationName,
            }

            console.log("Creating station with data:", stationToCreate);

            await stationService.createStation(stationToCreate);
            await fetchStations();
            setIsAdding(false);
            setFormData({
                stationName: '',
            });
            setError(null);
        } catch (error) {
            setError('Failed to create station: ' + (error.toString() || 'Unknown error'));
            console.error(error);
        }
    }

    const handleUpdate = async () => {
        try {
            if(!validateForm()) return;

            const stationToUpdate = {
                stationName: formData.stationName.trim(),
            }

            console.log("Updating station ID:", editingId, "with data:", stationToUpdate);

            await stationService.updateStation(editingId, stationToUpdate);
            await fetchStations();
            setEditingId(null);
            setFormData({
                stationName: '',
            });
            setError(null);
        } catch (error) {
            setError('Failed to update station: ' + (error.toString() || 'Unknown error'));
            console.error(error);
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this station?')) {
            try {
                await stationService.deleteStation(id);
                await fetchStations();
                setError(null);
            } catch (error) {
                setError('Failed to delete station: ' + (error.toString() || 'Unknown error'));
                console.error(error);
            }
        }
    };

    if(loading){
        return <div className="p-4 text-center">Loading stations...</div>;
    }

    return (
        <div className="p-4 h-screen flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Station Management</h1>
                <button
                    onClick={handleAddNew}
                    disabled={isAdding || editingId !== null}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
                >
                    <FaPlus className="mr-2" /> Add New Station
                </button>
            </div>
            
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                    <p>{error}</p>
                </div>
            )}
            
            {/* Scrollable table container with fixed height */}
            <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
                <table className="min-w-full bg-white">
                    <thead className="sticky top-0 bg-gray-50 z-10">
                        <tr>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Station Name</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-center">Actions</th>
                        </tr>
                        {isAdding && (
                            <tr className="bg-blue-50 sticky top-[41px] z-10">
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <input
                                        type='text'
                                        name='stationName'
                                        value={formData.stationName}
                                        onChange={handleChange}
                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                        placeholder="Station Name"
                                    />
                                </td>
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <div className="flex justify-center space-x-2">
                                        <button 
                                            onClick={handleSaveNew}
                                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded flex items-center"
                                        >
                                            <FaSave className="mr-1" /> Save
                                        </button>
                                        <button 
                                            onClick={handleCancel}
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
                        
                        {stations.length > 0 ? (
                            stations.map((station) => (
                                <tr key={station.stationID} className={editingId === station.stationID ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        {editingId === station.stationID ? (
                                            <input
                                                type="text"
                                                name="stationName"
                                                value={formData.stationName}
                                                onChange={handleChange}
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
                                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded flex items-center"
                                                    >
                                                        <FaSave className="mr-1" /> Save
                                                    </button>
                                                    <button 
                                                        onClick={handleCancel}
                                                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded flex items-center"
                                                    >
                                                        <FaTimes className="mr-1" /> Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button 
                                                        onClick={() => handleEdit(station)}
                                                        disabled={isAdding || editingId !== null}
                                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <FaEdit className="mr-1" /> Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(station.stationID)}
                                                        disabled={isAdding || editingId !== null}
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
                                <td colSpan="2" className="px-4 py-8 border-b border-gray-200 text-center text-gray-500">
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