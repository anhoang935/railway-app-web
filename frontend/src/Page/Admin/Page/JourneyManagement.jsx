import React, { useState, useEffect } from 'react';
import journeyService from '../../../data/Service/journeyService';
import LoadingSpinner from '../Components/LoadingSpinner';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import './JourneyManagement.css';

const JourneyManagement = ({ setActiveTab }) => {
    const [journeys, setJourneys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedJourney, setSelectedJourney] = useState(null);
    const [formData, setFormData] = useState({
        journeyID: '',
        scheduleID: '',
        stationID: '',
        arrivalTime: '',
        departureTime: ''
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchJourneys();
    }, []);

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const openAddModal = () => {
        setIsEditMode(false);
        setFormData({
            journeyID: '',
            scheduleID: '',
            stationID: '',
            arrivalTime: '',
            departureTime: ''
        });
        setIsModalOpen(true);
    };

    const openEditModal = (journey) => {
        setIsEditMode(true);
        setSelectedJourney(journey);
        setFormData({
            journeyID: journey.journeyID,
            scheduleID: journey.scheduleID,
            stationID: journey.stationID,
            arrivalTime: journey.arrivalTime,
            departureTime: journey.departureTime
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await journeyService.updateJourney(selectedJourney.journeyID, formData);
                alert('Journey updated successfully');
            } else {
                await journeyService.createJourney(formData);
                alert('Journey created successfully');
            }
            closeModal();
            fetchJourneys();
        } catch (error) {
            console.error('Error saving journey:', error);
            alert(`Failed to ${isEditMode ? 'update' : 'create'} journey: ${error.message}`);
        }
    };

    const handleDelete = async (journeyID) => {
        if (window.confirm('Are you sure you want to delete this journey?')) {
            try {
                await journeyService.deleteJourney(journeyID);
                alert('Journey deleted successfully');
                fetchJourneys();
            } catch (error) {
                console.error('Error deleting journey:', error);
                alert('Failed to delete journey: ' + error.message);
            }
        }
    };

    const handleReturnToDashboard = () => {
        setActiveTab('dashboard');
    };

    return (
        <div className="journey-management">
            <div className="journey-management-header">
                <h1 className="text-2xl font-bold">Journey Management</h1>
                <button
                    onClick={openAddModal}
                    className="btn-add"
                >
                    <FaPlus className="mr-2" /> Add New Journey
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <LoadingSpinner />
            ) : (
                <div className="journey-table-container">
                    {journeys.length > 0 ? (
                        <table className="journey-table">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border font-bold">Journey ID</th>
                                    <th className="px-4 py-2 border font-bold">Schedule ID</th>
                                    <th className="px-4 py-2 border font-bold">Station ID</th>
                                    <th className="px-4 py-2 border font-bold">Arrival Time</th>
                                    <th className="px-4 py-2 border font-bold">Departure Time</th>
                                    <th className="px-4 py-2 border font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {journeys.map(journey => (
                                    <tr key={journey.journeyID}>
                                        <td className="px-4 py-2 border">{journey.journeyID}</td>
                                        <td className="px-4 py-2 border">{journey.scheduleID}</td>
                                        <td className="px-4 py-2 border">{journey.stationID}</td>
                                        <td className="px-4 py-2 border">{journey.arrivalTime || 'N/A'}</td>
                                        <td className="px-4 py-2 border">{journey.departureTime || 'N/A'}</td>
                                        <td className="px-4 py-2 border action-buttons">
                                            <button
                                                className="btn-edit"
                                                onClick={() => openEditModal(journey)}
                                            >
                                                <FaEdit className="mr-1" /> Edit
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDelete(journey.journeyID)}
                                            >
                                                <FaTrash className="mr-1" /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="no-data">No journeys found. Add your first journey!</div>
                    )}
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{isEditMode ? 'Edit Journey' : 'Add New Journey'}</h3>
                        <button className="modal-close" onClick={closeModal}>&times;</button>

                        <form onSubmit={handleSubmit}>
                            {!isEditMode && (
                                <div className="form-group">
                                    <label htmlFor="journeyID">Journey ID:</label>
                                    <input
                                        id="journeyID"
                                        type="text"
                                        name="journeyID"
                                        value={formData.journeyID}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            )}
                            <div className="form-group">
                                <label htmlFor="scheduleID">Schedule ID:</label>
                                <input
                                    id="scheduleID"
                                    type="number"
                                    name="scheduleID"
                                    value={formData.scheduleID}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="stationID">Station ID:</label>
                                <input
                                    id="stationID"
                                    type="number"
                                    name="stationID"
                                    value={formData.stationID}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="arrivalTime">Arrival Time:</label>
                                <input
                                    id="arrivalTime"
                                    type="time"
                                    name="arrivalTime"
                                    value={formData.arrivalTime}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="departureTime">Departure Time:</label>
                                <input
                                    id="departureTime"
                                    type="time"
                                    name="departureTime"
                                    value={formData.departureTime}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={closeModal} className="btn-cancel">Cancel</button>
                                <button type="submit" className="btn-submit">
                                    {isEditMode ? 'Update Journey' : 'Add Journey'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {journeys.length === 0 && !loading && !error && (
                <div className="text-center mt-4">
                    <button onClick={handleReturnToDashboard} className="btn-dashboard">
                        Return to Dashboard
                    </button>
                </div>
            )}
        </div>
    );
};

export default JourneyManagement;