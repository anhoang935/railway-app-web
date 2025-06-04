import React, { useState } from 'react';
import { Edit, Trash2, Ticket, BookOpen, ChevronDown, ChevronUp, X, Check, Plus } from 'lucide-react';
import { FaSave, FaTimes } from 'react-icons/fa';
import passengerService from '../../../data/Service/passengerService';
import { useLoadingWithTimeout } from '../../../hooks/useLoadingWithTimeout';
import { useAsyncData } from '../../../hooks/useAsyncData';
import LoadingPage from '../../../components/LoadingPage';

function PassengerManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [expandedRow, setExpandedRow] = useState(null);
    const [expandedContent, setExpandedContent] = useState(null);
    const [expandedContentLoading, setExpandedContentLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        phone_number: '',
        id_number: '',
        address: '',
        status: 'active'
    });

    // Use useAsyncData for initial data fetching
    const {
        data: passengers,
        loading: dataLoading,
        error: dataError,
        refetch: refetchPassengers,
        setData: setPassengers
    } = useAsyncData(() => passengerService.getAllPassengers());

    // Use useLoadingWithTimeout for operations
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
        return <LoadingPage message="Loading passengers..." />;
    }

    // Combine error states
    const currentError = dataError || operationError;

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this passenger?')) {
            try {
                startLoading();

                await passengerService.deletePassenger(id);

                // Optimistic update
                setPassengers(prevPassengers => prevPassengers.filter(passenger => passenger.passengerID !== id));

                stopLoading();
            } catch (error) {
                setLoadingError('Failed to delete passenger: ' + (error.toString() || 'Unknown error'));
                console.error(error);
                // If delete failed, refetch to ensure data consistency
                await refetchPassengers();
            }
        }
    };

    const handleEdit = (passenger) => {
        setFormData({
            fullname: passenger.fullname || '',
            email: passenger.email || '',
            phone_number: passenger.phone_number || '',
            id_number: passenger.id_number || '',
            address: passenger.address || '',
            status: passenger.status || 'active'
        });
        setEditingId(passenger.passengerID);
        setIsAdding(false);
        setOperationError(null);
    };

    const handleUpdate = async () => {
        try {
            if (!validateForm()) return;

            startLoading();

            const passengerToUpdate = {
                fullname: formData.fullname.trim(),
                email: formData.email.trim(),
                phone_number: formData.phone_number.trim(),
                id_number: formData.id_number?.trim() || null,
                address: formData.address?.trim() || null,
                status: formData.status
            };

            const updatedPassenger = await passengerService.updatePassenger(editingId, passengerToUpdate);

            // Optimistic update
            if (updatedPassenger) {
                setPassengers(prevPassengers =>
                    prevPassengers.map(passenger =>
                        passenger.passengerID === editingId ? updatedPassenger : passenger
                    )
                );
            } else {
                await refetchPassengers();
            }

            // Reset form and state
            setEditingId(null);
            setFormData({
                fullname: '',
                email: '',
                phone_number: '',
                id_number: '',
                address: '',
                status: 'active'
            });

            stopLoading();
        } catch (error) {
            setLoadingError('Failed to update passenger: ' + (error.toString() || 'Unknown error'));
            console.error(error);
        }
    };

    const handleViewTickets = async (passengerID) => {
        // If already expanded with tickets, close it
        if (expandedRow === passengerID && expandedContent === 'tickets') {
            setExpandedRow(null);
            setExpandedContent(null);
            return;
        }

        try {
            setExpandedRow(passengerID);
            setExpandedContent('tickets');
            setExpandedContentLoading(true);

            const tickets = await passengerService.getPassengerTickets(passengerID);

            // Update the specific passenger with tickets
            setPassengers(prevPassengers =>
                prevPassengers.map(passenger =>
                    passenger.passengerID === passengerID
                        ? { ...passenger, tickets }
                        : passenger
                )
            );
        } catch (error) {
            console.error('Error fetching passenger tickets:', error);
            setOperationError('Failed to load tickets. Please try again later.');
            setExpandedRow(null);
            setExpandedContent(null);
        } finally {
            setExpandedContentLoading(false);
        }
    };

    const handleViewBookings = async (passengerID) => {
        // If already expanded with bookings, close it
        if (expandedRow === passengerID && expandedContent === 'bookings') {
            setExpandedRow(null);
            setExpandedContent(null);
            return;
        }

        try {
            setExpandedRow(passengerID);
            setExpandedContent('bookings');
            setExpandedContentLoading(true);

            const bookings = await passengerService.getPassengerBookings(passengerID);

            // Update the specific passenger with bookings
            setPassengers(prevPassengers =>
                prevPassengers.map(passenger =>
                    passenger.passengerID === passengerID
                        ? { ...passenger, bookings }
                        : passenger
                )
            );
        } catch (error) {
            console.error('Error fetching passenger bookings:', error);
            setOperationError('Failed to load bookings. Please try again later.');
            setExpandedRow(null);
            setExpandedContent(null);
        } finally {
            setExpandedContentLoading(false);
        }
    };

    const handleCloseExpanded = () => {
        setExpandedRow(null);
        setExpandedContent(null);
    };

    const filteredPassengers = passengers.filter(passenger => {
        const matchesSearch =
            passenger.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            passenger.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            passenger.phone_number?.includes(searchTerm);

        const matchesStatus =
            statusFilter === 'All Status' ||
            passenger.status?.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        const statusClasses = {
            'active': 'bg-green-100 text-green-800',
            'inactive': 'bg-red-100 text-red-800',
            'pending': 'bg-yellow-100 text-yellow-800'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    const renderExpandedContent = (passenger) => {
        if (expandedContentLoading) {
            return (
                <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading...</p>
                </div>
            );
        }

        if (expandedContent === 'tickets') {
            const tickets = passenger.tickets || [];
            if (tickets.length === 0) {
                return <div className="p-4 text-center text-gray-500">No tickets found for this passenger.</div>;
            }

            return (
                <div className="p-4 bg-blue-50 rounded-md">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-blue-800">Tickets for {passenger.fullname}</h3>
                        <button onClick={handleCloseExpanded} className="text-gray-500 hover:text-gray-700">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-md">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Train</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seat</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coach</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {tickets.map(ticket => (
                                    <tr key={ticket.ticketID}>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{ticket.ticketID}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{ticket.trainName}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{ticket.departureStation}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{ticket.arrivalStation}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(ticket.departureDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{ticket.departureTime}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{ticket.seatNumber}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{ticket.coachType}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        } else if (expandedContent === 'bookings') {
            const bookings = passenger.bookings || [];
            if (bookings.length === 0) {
                return <div className="p-4 text-center text-gray-500">No bookings found for this passenger.</div>;
            }

            return (
                <div className="p-4 bg-purple-50 rounded-md">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-purple-800">Bookings for {passenger.fullname}</h3>
                        <button onClick={handleCloseExpanded} className="text-gray-500 hover:text-gray-700">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-md">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {bookings.map(booking => (
                                    <tr key={booking.bookingID}>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{booking.bookingID}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(booking.bookingDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.totalPrice)}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            {getStatusBadge(booking.status)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        return null;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddNew = () => {
        setFormData({
            fullname: '',
            email: '',
            phone_number: '',
            id_number: '',
            address: '',
            status: 'active'
        });
        setIsAdding(true);
        setOperationError(null);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setOperationError(null);
        setFormData({
            fullname: '',
            email: '',
            phone_number: '',
            id_number: '',
            address: '',
            status: 'active'
        });
    };

    const validateForm = () => {
        if (!formData.fullname?.trim()) {
            setOperationError('Full name is required.');
            return false;
        }
        if (!formData.email?.trim()) {
            setOperationError('Email address is required.');
            return false;
        }
        if (!formData.phone_number?.trim()) {
            setOperationError('Phone number is required.');
            return false;
        }
        return true;
    };

    const handleSaveNew = async () => {
        try {
            if (!validateForm()) return;

            startLoading();

            const passengerToCreate = {
                fullname: formData.fullname.trim(),
                email: formData.email.trim(),
                phone_number: formData.phone_number.trim(),
                id_number: formData.id_number?.trim() || null,
                address: formData.address?.trim() || null,
                status: formData.status
            };

            const newPassenger = await passengerService.createPassenger(passengerToCreate);

            // Optimistic update
            if (newPassenger) {
                setPassengers(prevPassengers => [...prevPassengers, newPassenger]);
            } else {
                await refetchPassengers();
            }

            // Reset form and state
            setIsAdding(false);
            setFormData({
                fullname: '',
                email: '',
                phone_number: '',
                id_number: '',
                address: '',
                status: 'active'
            });

            stopLoading();
        } catch (error) {
            setLoadingError('Failed to create passenger: ' + (error.toString() || 'Unknown error'));
            console.error(error);
        }
    };

    return (
        <div className="p-4 h-screen flex flex-col passenger-management relative">
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
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Passenger Management</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={refetchPassengers}
                        disabled={isAdding || operationLoading}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Refresh passengers"
                    >
                        Refresh
                    </button>
                    <button
                        onClick={handleAddNew}
                        disabled={isAdding || operationLoading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus size={16} className="mr-2" />
                        Add New Passenger
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
                                if (dataError) refetchPassengers();
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
                    <strong>Passengers:</strong> {passengers.length} |
                    <strong> Filtered:</strong> {filteredPassengers.length} |
                    <strong> Last updated:</strong> {new Date().toLocaleTimeString()}
                </p>
            </div>

            {/* Search and filter controls */}
            <div className="mb-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search passengers..."
                            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                    </div>
                </div>

                <select
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All Status">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                </select>
            </div>

            {/* Passenger table */}
            <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
                <table className="min-w-full bg-white">
                    <thead className="sticky top-0 bg-gray-50 z-10">
                        <tr>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Passenger ID</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Full Name</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Phone</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Email</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Status</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-center">Actions</th>
                        </tr>
                        {/* Add New Row Form */}
                        {isAdding && (
                            <>
                                <tr className="bg-blue-50 sticky top-[41px] z-10">
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        <span className="text-gray-500 italic">Auto-generated</span>
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        <input
                                            type="text"
                                            name="fullname"
                                            value={formData.fullname}
                                            onChange={handleInputChange}
                                            disabled={operationLoading}
                                            className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                            placeholder="Full Name*"
                                        />
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        <input
                                            type="text"
                                            name="phone_number"
                                            value={formData.phone_number}
                                            onChange={handleInputChange}
                                            disabled={operationLoading}
                                            className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                            placeholder="Phone Number*"
                                        />
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            disabled={operationLoading}
                                            className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                            placeholder="Email Address*"
                                        />
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            disabled={operationLoading}
                                            className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="pending">Pending</option>
                                        </select>
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
                                {/* Additional form fields row */}
                                <tr className="bg-blue-50 sticky top-[82px] z-10">
                                    <td colSpan="6" className="px-4 py-2 border-b border-gray-200">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                                                <input
                                                    type="text"
                                                    name="id_number"
                                                    value={formData.id_number}
                                                    onChange={handleInputChange}
                                                    disabled={operationLoading}
                                                    className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                    placeholder="ID Number (Optional)"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                                <textarea
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    disabled={operationLoading}
                                                    className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                    rows="2"
                                                    placeholder="Address (Optional)"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </>
                        )}
                    </thead>
                    <tbody>
                        {filteredPassengers.length > 0 ? (
                            filteredPassengers.map(passenger => (
                                <React.Fragment key={passenger.passengerID}>
                                    <tr className={`hover:bg-gray-50 ${editingId === passenger.passengerID ? 'bg-yellow-50' : ''}`}>
                                        <td className="px-4 py-2 border-b border-gray-200 font-bold">{passenger.passengerID}</td>
                                        <td className="px-4 py-2 border-b border-gray-200">
                                            {editingId === passenger.passengerID ? (
                                                <input
                                                    type="text"
                                                    name="fullname"
                                                    value={formData.fullname}
                                                    onChange={handleInputChange}
                                                    disabled={operationLoading}
                                                    className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                    placeholder="Full Name*"
                                                />
                                            ) : (
                                                passenger.fullname
                                            )}
                                        </td>
                                        <td className="px-4 py-2 border-b border-gray-200">
                                            {editingId === passenger.passengerID ? (
                                                <input
                                                    type="text"
                                                    name="phone_number"
                                                    value={formData.phone_number}
                                                    onChange={handleInputChange}
                                                    disabled={operationLoading}
                                                    className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                    placeholder="Phone Number*"
                                                />
                                            ) : (
                                                passenger.phone_number
                                            )}
                                        </td>
                                        <td className="px-4 py-2 border-b border-gray-200">
                                            {editingId === passenger.passengerID ? (
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    disabled={operationLoading}
                                                    className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                    placeholder="Email Address*"
                                                />
                                            ) : (
                                                passenger.email
                                            )}
                                        </td>
                                        <td className="px-4 py-2 border-b border-gray-200">
                                            {editingId === passenger.passengerID ? (
                                                <select
                                                    name="status"
                                                    value={formData.status}
                                                    onChange={handleInputChange}
                                                    disabled={operationLoading}
                                                    className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                    <option value="pending">Pending</option>
                                                </select>
                                            ) : (
                                                getStatusBadge(passenger.status)
                                            )}
                                        </td>
                                        <td className="px-4 py-2 border-b border-gray-200">
                                            <div className="flex justify-center space-x-2">
                                                {editingId === passenger.passengerID ? (
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
                                                            onClick={() => handleEdit(passenger)}
                                                            disabled={isAdding || editingId !== null || operationLoading}
                                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Edit passenger"
                                                        >
                                                            <Edit size={14} className="mr-1" /> Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleViewTickets(passenger.passengerID)}
                                                            disabled={isAdding || editingId !== null || operationLoading}
                                                            className={`${expandedRow === passenger.passengerID && expandedContent === 'tickets' ? 'bg-orange-500 hover:bg-orange-700' : 'bg-purple-500 hover:bg-purple-700'} text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed`}
                                                            title="View tickets"
                                                        >
                                                            <Ticket size={14} className="mr-1" />
                                                            {expandedRow === passenger.passengerID && expandedContent === 'tickets' ?
                                                                <ChevronUp size={14} /> :
                                                                <ChevronDown size={14} />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleViewBookings(passenger.passengerID)}
                                                            disabled={isAdding || editingId !== null || operationLoading}
                                                            className={`${expandedRow === passenger.passengerID && expandedContent === 'bookings' ? 'bg-orange-500 hover:bg-orange-700' : 'bg-indigo-500 hover:bg-indigo-700'} text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed`}
                                                            title="View bookings"
                                                        >
                                                            <BookOpen size={14} className="mr-1" />
                                                            {expandedRow === passenger.passengerID && expandedContent === 'bookings' ?
                                                                <ChevronUp size={14} /> :
                                                                <ChevronDown size={14} />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(passenger.passengerID)}
                                                            disabled={isAdding || editingId !== null || operationLoading}
                                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Delete passenger"
                                                        >
                                                            <Trash2 size={14} className="mr-1" /> Delete
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    {/* Additional edit form fields row - only show when editing this passenger */}
                                    {editingId === passenger.passengerID && (
                                        <tr className="bg-yellow-50">
                                            <td colSpan="6" className="px-4 py-2 border-b border-gray-200">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                                                        <input
                                                            type="text"
                                                            name="id_number"
                                                            value={formData.id_number}
                                                            onChange={handleInputChange}
                                                            disabled={operationLoading}
                                                            className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                            placeholder="ID Number (Optional)"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                                        <textarea
                                                            name="address"
                                                            value={formData.address}
                                                            onChange={handleInputChange}
                                                            disabled={operationLoading}
                                                            className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                            rows="2"
                                                            placeholder="Address (Optional)"
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {expandedRow === passenger.passengerID && expandedContent && (
                                        <tr>
                                            <td colSpan="6" className="p-0 border-b-0">
                                                {renderExpandedContent(passenger)}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-4 py-8 border-b border-gray-200 text-center text-gray-500">
                                    No passengers found. Add a new passenger to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default PassengerManagement;