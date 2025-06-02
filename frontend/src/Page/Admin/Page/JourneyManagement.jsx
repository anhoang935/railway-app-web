import React, { useState, useEffect } from 'react';
import journeyService from '../../../data/Service/journeyService';
import stationService from '../../../data/Service/stationService'; // Add this import
import scheduleService from '../../../data/Service/scheduleService';
import LoadingSpinner from '../Components/LoadingSpinner';
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from 'react-icons/fa';
import './JourneyManagement.css';

const JourneyManagement = ({ setActiveTab }) => {
    const [journeys, setJourneys] = useState([]);
    const [stations, setStations] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState(null);
    const [isJourneyIDManual, setIsJourneyIDManual] = useState(false); // Add this state
    const [formData, setFormData] = useState({
        journeyID: '',
        scheduleID: '',
        stationID: '',
        arrivalTime: '',
        departureTime: ''
    });

    useEffect(() => {
        fetchJourneys();
        fetchStations(); // Add this function call
        fetchSchedules();
    }, []);

    // Add this function to fetch stations
    const fetchStations = async () => {
        try {
            const data = await stationService.getAllStations();
            setStations(data);
        } catch (error) {
            console.error('Error fetching stations:', error);
            setError('Failed to load station data. Please try again.');
        }
    };

    const fetchJourneys = async () => {
        try {
            setLoading(true);
            const data = await journeyService.getAllJourneys();
            setJourneys(data);
            setError(null);
        } catch (error) {
            console.error('Error fetching journeys:', error);
            setError('Failed to load journey data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchSchedules = async () => {
        try {
            const data = await scheduleService.getAllSchedules();
            setSchedules(data);
        } catch (error) {
            console.error('Error fetching schedules:', error);
            setError('Failed to load schedule data. Please try again.');
        }
    };

    const handleAddNew = () => {
        setIsAdding(true);
        setEditingId(null);
        setIsJourneyIDManual(false); // Reset manual mode
        setFormData({
            journeyID: '',
            scheduleID: '',
            stationID: '',
            arrivalTime: '',
            departureTime: ''
        });
    };

    // Add new function to generate journey ID based on selected schedule
    const generateJourneyID = (selectedScheduleID) => {
        if (!selectedScheduleID) return '';

        // Find all existing journeys for this schedule
        const journeysForSchedule = journeys.filter(j =>
            j.scheduleID.toString() === selectedScheduleID.toString()
        );

        // Get the highest auto-increment number for this schedule
        const maxAutoIncrement = journeysForSchedule.length > 0
            ? Math.max(...journeysForSchedule.map(j => {
                const journeyIdStr = j.journeyID.toString();
                if (journeyIdStr.length >= 4) {
                    // Extract last 2 digits as auto-increment
                    return parseInt(journeyIdStr.slice(-2)) || 0;
                }
                return 0;
            }))
            : 0;

        // Format: ab (schedule ID padded to 2 digits) + cd (auto-increment padded to 2 digits)
        const schedulePart = selectedScheduleID.toString().padStart(2, '0');
        const autoIncrementPart = (maxAutoIncrement + 1).toString().padStart(2, '0');

        return schedulePart + autoIncrementPart;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const newFormData = {
            ...formData,
            [name]: value
        };

        // Auto-generate journey ID when schedule is selected during adding (only if not in manual mode)
        if (name === 'scheduleID' && isAdding && !isJourneyIDManual) {
            newFormData.journeyID = generateJourneyID(value);
        }

        setFormData(newFormData);
    };

    // Add function to toggle manual journey ID editing
    const toggleJourneyIDEdit = () => {
        setIsJourneyIDManual(!isJourneyIDManual);
        if (!isJourneyIDManual && formData.scheduleID) {
            // If switching from manual to auto, regenerate the ID
            setFormData(prev => ({
                ...prev,
                journeyID: generateJourneyID(prev.scheduleID)
            }));
        }
    };

    const handleEdit = (journey) => {
        setIsAdding(false);
        setEditingId(journey.journeyID);
        setFormData({
            journeyID: journey.journeyID,
            scheduleID: journey.scheduleID,
            stationID: journey.stationID,
            arrivalTime: journey.arrivalTime || '',
            departureTime: journey.departureTime || ''
        });
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({
            journeyID: '',
            scheduleID: '',
            stationID: '',
            arrivalTime: '',
            departureTime: ''
        });
    };

    const validateForm = () => {
        if (!formData.journeyID || formData.journeyID.toString().trim() === '') {
            setError('Journey ID is required.');
            return false;
        }
        if (!formData.scheduleID || formData.scheduleID.toString().trim() === '') {
            setError('Schedule ID is required.');
            return false;
        }
        if (!formData.stationID || formData.stationID.toString().trim() === '') {
            setError('Station ID is required.');
            return false;
        }
        return true;
    };

    const handleSaveNew = async () => {
        try {
            if (!validateForm()) return;

            const journeyToCreate = {
                journeyID: formData.journeyID,
                scheduleID: formData.scheduleID,
                stationID: formData.stationID,
                arrivalTime: formData.arrivalTime,
                departureTime: formData.departureTime
            };

            await journeyService.createJourney(journeyToCreate);
            await fetchJourneys();
            setIsAdding(false);
            setFormData({
                journeyID: '',
                scheduleID: '',
                stationID: '',
                arrivalTime: '',
                departureTime: ''
            });
            setError(null);
        } catch (error) {
            setError('Failed to create journey: ' + (error.toString() || 'Unknown error'));
            console.error(error);
        }
    };

    const handleUpdate = async () => {
        try {
            if (!validateForm()) return;

            const journeyToUpdate = {
                journeyID: formData.journeyID,
                scheduleID: formData.scheduleID,
                stationID: formData.stationID,
                arrivalTime: formData.arrivalTime,
                departureTime: formData.departureTime
            };

            await journeyService.updateJourney(editingId, journeyToUpdate);
            await fetchJourneys();
            setEditingId(null);
            setFormData({
                journeyID: '',
                scheduleID: '',
                stationID: '',
                arrivalTime: '',
                departureTime: ''
            });
            setError(null);
        } catch (error) {
            setError('Failed to update journey: ' + (error.toString() || 'Unknown error'));
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this journey?')) {
            try {
                await journeyService.deleteJourney(id);
                await fetchJourneys();
                setError(null);
            } catch (error) {
                setError('Failed to delete journey: ' + (error.toString() || 'Unknown error'));
                console.error(error);
            }
        }
    };

    // Find station name by ID (helper function)
    const getStationNameById = (id) => {
        const station = stations.find(s => s.stationID.toString() === id.toString());
        return station ? station.stationName : 'Unknown Station';
    };

    // Helper function to display schedule information
    const getScheduleDisplayText = (scheduleID) => {
        const schedule = schedules.find(s => s.scheduleID.toString() === scheduleID.toString());
        if (schedule) {
            return `${schedule.start_stationName} → ${schedule.end_stationName} (${schedule.trainName})`;
        }
        return 'Unknown Schedule';
    };

    if (loading) {
        return <div className="p-4 text-center"><LoadingSpinner /></div>;
    }

    return (
        <div className="p-4 h-screen flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Journey Management</h1>
                <button
                    onClick={handleAddNew}
                    disabled={isAdding || editingId !== null}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaPlus className="mr-2" /> Add New Journey
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                    <p>{error}</p>
                </div>
            )}

            <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
                <table className="min-w-full bg-white">
                    <thead className="sticky top-0 bg-gray-50 z-10">
                        <tr>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Journey ID</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Train Schedule</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Station</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Arrival Time</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Departure Time</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-center">Actions</th>
                        </tr>
                        {isAdding && (
                            <tr className="bg-blue-50 sticky top-[41px] z-10">
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <div className="h-12 flex items-center"> {/* Changed to match other cells */}
                                        <div className="flex items-center space-x-2 w-full">
                                            <input
                                                type="text"
                                                name="journeyID"
                                                value={formData.journeyID}
                                                onChange={handleInputChange}
                                                readOnly={!isJourneyIDManual}
                                                className={`flex-1 px-2 py-1 border rounded focus:outline-none h-8 ${isJourneyIDManual
                                                    ? 'focus:border-blue-500 bg-white'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}
                                                placeholder={isJourneyIDManual ? "Enter Journey ID" : "Select schedule first"}
                                            />
                                            <button
                                                type="button"
                                                onClick={toggleJourneyIDEdit}
                                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-2 rounded flex items-center justify-center text-xs h-8 w-12 flex-shrink-0"
                                                title={isJourneyIDManual ? "Switch to auto-generate" : "Edit manually"}
                                            >
                                                {isJourneyIDManual ? "Auto" : "Edit"}
                                            </button>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <div className="h-12 flex items-center"> {/* Fixed height container */}
                                        <select
                                            name="scheduleID"
                                            value={formData.scheduleID}
                                            onChange={handleInputChange}
                                            className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500 h-8"
                                        >
                                            <option value="">Select Schedule</option>
                                            {schedules.map(schedule => (
                                                <option key={schedule.scheduleID} value={schedule.scheduleID}>
                                                    {schedule.start_stationName} → {schedule.end_stationName} ({schedule.trainName})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </td>
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <div className="h-12 flex items-center"> {/* Fixed height container */}
                                        <select
                                            name="stationID"
                                            value={formData.stationID}
                                            onChange={handleInputChange}
                                            className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500 h-8"
                                        >
                                            <option value="">Select Station</option>
                                            {stations.map(station => (
                                                <option key={station.stationID} value={station.stationID}>
                                                    {station.stationName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </td>
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <div className="h-12 flex items-center"> {/* Fixed height container */}
                                        <input
                                            type="time"
                                            name="arrivalTime"
                                            value={formData.arrivalTime}
                                            onChange={handleInputChange}
                                            className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500 h-8"
                                        />
                                    </div>
                                </td>
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <div className="h-12 flex items-center"> {/* Fixed height container */}
                                        <input
                                            type="time"
                                            name="departureTime"
                                            value={formData.departureTime}
                                            onChange={handleInputChange}
                                            className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500 h-8"
                                        />
                                    </div>
                                </td>
                                <td className="px-4 py-2 border-b border-gray-200">
                                    <div className="h-12 flex justify-center items-center space-x-2"> {/* Fixed height container */}
                                        <button
                                            onClick={handleSaveNew}
                                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded flex items-center h-8"
                                        >
                                            <FaSave className="mr-1" /> Save
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded flex items-center h-8"
                                        >
                                            <FaTimes className="mr-1" /> Cancel
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {journeys.length > 0 ? (
                            journeys.map((journey) => (
                                <tr key={journey.journeyID} className={editingId === journey.journeyID ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        {journey.journeyID}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        {editingId === journey.journeyID ? (
                                            <select
                                                name="scheduleID"
                                                value={formData.scheduleID}
                                                onChange={handleInputChange}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                            >
                                                <option value="">Select Schedule</option>
                                                {schedules.map(schedule => (
                                                    <option key={schedule.scheduleID} value={schedule.scheduleID}>
                                                        {schedule.start_stationName} → {schedule.end_stationName} ({schedule.trainName})
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            getScheduleDisplayText(journey.scheduleID)
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        {editingId === journey.journeyID ? (
                                            <select
                                                name="stationID"
                                                value={formData.stationID}
                                                onChange={handleInputChange}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                            >
                                                <option value="">Select Station</option>
                                                {stations.map(station => (
                                                    <option key={station.stationID} value={station.stationID}>
                                                        {station.stationName}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            getStationNameById(journey.stationID)
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        {editingId === journey.journeyID ? (
                                            <div className="h-12 flex items-center">
                                                <input
                                                    type="time"
                                                    name="arrivalTime"
                                                    value={formData.arrivalTime}
                                                    onChange={handleInputChange}
                                                    className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500 h-8"
                                                />
                                            </div>
                                        ) : (
                                            journey.arrivalTime || 'N/A'
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        {editingId === journey.journeyID ? (
                                            <div className="h-12 flex items-center">
                                                <input
                                                    type="time"
                                                    name="departureTime"
                                                    value={formData.departureTime}
                                                    onChange={handleInputChange}
                                                    className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500 h-8"
                                                />
                                            </div>
                                        ) : (
                                            journey.departureTime || 'N/A'
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        <div className="flex justify-center space-x-2">
                                            {editingId === journey.journeyID ? (
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
                                                        onClick={() => handleEdit(journey)}
                                                        disabled={isAdding || editingId !== null}
                                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <FaEdit className="mr-1" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(journey.journeyID)}
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
                                <td colSpan="6" className="px-4 py-8 border-b border-gray-200 text-center text-gray-500">
                                    No journeys found. Add a new journey to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default JourneyManagement;