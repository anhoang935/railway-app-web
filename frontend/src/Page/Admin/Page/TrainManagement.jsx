import React, { useState, useEffect } from 'react';
import trainService from '../../../data/Service/trainService';
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from 'react-icons/fa';

const TrainManagement = () => {
    const [trains, setTrains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
  
    // Form state for adding/editing trains
    const [formData, setFormData] = useState({
        trainName: '',
        trainType: 'SE', // Set a default value for trainType
        coachTotal: ''
    });
  
    // Load trains on component mount
    useEffect(() => {
        fetchTrains();
    }, []);
  
    // Fetch all trains
    const fetchTrains = async () => {
        try {
            setLoading(true);
            const trainsData = await trainService.getAllTrains();
            setTrains(trainsData);
            setError(null);
        } 
        catch(err){
            setError('Failed to load trains. Please try again later.');
            console.error(err);
        } 
        finally{
            setLoading(false);
        }
    };
  
    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
    
        // Fix for coachTotal handling
        if(name === 'coachTotal'){
            // Allow empty string during typing, but convert to number when not empty
            const newValue = value === '' ? '' : parseInt(value, 10);
            setFormData(prev => ({
                ...prev,
                [name]: newValue
            }));
        }
        else{
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
            trainType: 'SE', // Set default value
            coachTotal: ''
        });
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
    };
  
    // Validate form data
    const validateForm = () => {
        // Log the form data to help with debugging
        console.log("Validating form data:", formData);
    
        if (!formData.trainName || formData.trainName.trim() === '') {
            setError('Please enter a train name');
            return false;
        }
    
        if (!formData.trainType) {
            setError('Please select a train type');
            return false;
        }
    
        // Specifically check for various invalid states of coachTotal
        if (formData.coachTotal === '' || 
            formData.coachTotal === null || 
            formData.coachTotal === undefined || 
            isNaN(Number(formData.coachTotal))) 
        {
            setError('Please enter a valid number for coach total');
            return false;
        }
    
        return true;
    };
  
    // Save a new train
    const handleSaveNew = async () => {
        try {
            if (!validateForm()) return;
      
            // Create a clean object with values properly formatted
            const trainToCreate = {
                trainName: formData.trainName.trim(),
                trainType: formData.trainType,
                coachTotal: Number(formData.coachTotal)
            };
      
            console.log("Creating train with data:", trainToCreate);
      
            await trainService.createTrain(trainToCreate);
            await fetchTrains();
            setIsAdding(false);
            setFormData({
                trainName: '',
                trainType: 'SE',
                coachTotal: ''
            });
            setError(null);
        } 
        catch(err){
            setError('Failed to create train: ' + (err.toString() || 'Unknown error'));
            console.error(err);
        }
    };
  
    // Update an existing train
    const handleUpdate = async () => {
        try {
            if (!validateForm()) return;
      
            // Create a clean object with values properly formatted
            const trainToUpdate = {
                trainName: formData.trainName.trim(),
                trainType: formData.trainType,
                coachTotal: Number(formData.coachTotal)
            };
      
            console.log("Updating train ID:", editingId, "with data:", trainToUpdate);
      
            await trainService.updateTrain(editingId, trainToUpdate);
            await fetchTrains();
            setEditingId(null);
            setFormData({
                trainName: '',
                trainType: 'SE',
                coachTotal: ''
            });
            setError(null);
        } 
        catch(err){
            setError('Failed to update train: ' + (err.toString() || 'Unknown error'));
            console.error(err);
        }
    };
  
    // Delete a train
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this train?')) {
        try {
            await trainService.deleteTrain(id);
            await fetchTrains();
            setError(null);
        } catch (err) {
            setError('Failed to delete train: ' + (err.toString() || 'Unknown error'));
            console.error(err);
        }
        }
    };
  
    if(loading){
        return <div className="p-4 text-center">Loading trains...</div>;
    }
  
    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Train Management</h1>
                <button 
                onClick={handleAddNew}
                disabled={isAdding || editingId}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
                >
                    <FaPlus className="mr-2" /> Add New Train
                </button>
            </div>
      
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                <p>{error}</p>
                </div>
            )}
      
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 border">Train Name</th>
                            <th className="px-4 py-2 border">Train Type</th>
                            <th className="px-4 py-2 border">Coach Total</th>
                            <th className="px-4 py-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                    {/* Add new train row */}
                    {isAdding && (
                        <tr className="bg-gray-50">
                            <td className="px-4 py-2 border">
                                <input
                                    type="text"
                                    name="trainName"
                                    value={formData.trainName}
                                    onChange={handleChange}
                                    className="w-full px-2 py-1 border rounded"
                                    placeholder="Train Name"
                                />
                            </td>
                            <td className="px-4 py-2 border">
                                <select
                                    name="trainType"
                                    value={formData.trainType}
                                    onChange={handleChange}
                                    className="w-full px-2 py-1 border rounded"
                                >
                                    <option value="SE">SE</option>
                                    <option value="TN">TN</option>
                                </select>
                            </td>
                            <td className="px-4 py-2 border">
                                <input
                                    type="number"
                                    name="coachTotal"
                                    value={formData.coachTotal}
                                    onChange={handleChange}
                                    className="w-full px-2 py-1 border rounded"
                                    placeholder="Coach Total"
                                    min="1"
                                />
                            </td>
                            <td className="px-4 py-2 border flex justify-around">
                                <button 
                                    onClick={handleSaveNew}
                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mr-2 flex items-center"
                                >
                                    <FaSave className="mr-1" /> Save
                                </button>
                                <button 
                                    onClick={handleCancel}
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded flex items-center"
                                >
                                    <FaTimes className="mr-1" /> Cancel
                                </button>
                            </td>
                        </tr>
                    )}
            
                    {/* Train list rows */}
                    {trains.length > 0 ? (
                        trains.map((train) => (
                            <tr key={train.trainID} className={editingId === train.trainID ? 'bg-yellow-50' : ''}>
                                <td className="px-4 py-2 border">
                                    {editingId === train.trainID ? (
                                    <input
                                        type="text"
                                        name="trainName"
                                        value={formData.trainName}
                                        onChange={handleChange}
                                        className="w-full px-2 py-1 border rounded"
                                    />
                                    ) : (
                                    train.trainName
                                    )}
                                </td>
                                <td className="px-4 py-2 border">
                                    {editingId === train.trainID ? (
                                    <select
                                        name="trainType"
                                        value={formData.trainType}
                                        onChange={handleChange}
                                        className="w-full px-2 py-1 border rounded"
                                    >
                                        <option value="SE">SE</option>
                                        <option value="TN">TN</option>
                                    </select>
                                    ) : (
                                    train.trainType
                                    )}
                                </td>
                                <td className="px-4 py-2 border">
                                    {editingId === train.trainID ? (
                                    <input
                                        type="number"
                                        name="coachTotal"
                                        value={formData.coachTotal}
                                        onChange={handleChange}
                                        className="w-full px-2 py-1 border rounded"
                                        min="1"
                                    />
                                    ) : (
                                    train.coachTotal
                                    )}
                                </td>
                                <td className="px-4 py-2 border flex justify-around">
                                    {editingId === train.trainID ? (
                                    <>
                                        <button 
                                        onClick={handleUpdate}
                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mr-2 flex items-center"
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
                                        onClick={() => handleEdit(train)}
                                        disabled={isAdding || editingId !== null}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2 flex items-center"
                                        >
                                        <FaEdit className="mr-1" /> Edit
                                        </button>
                                        <button 
                                        onClick={() => handleDelete(train.trainID)}
                                        disabled={isAdding || editingId !== null}
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded flex items-center"
                                        >
                                        <FaTrash className="mr-1" /> Delete
                                        </button>
                                    </>
                                    )}
                                </td>
                            </tr>
                        ))
                        ) : (
                        <tr>
                            <td colSpan="4" className="px-4 py-2 border text-center">
                            No trains found. Add a new train to get started.
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