import React, { useState } from 'react';
import { Edit, Trash2, Eye, ChevronDown, ChevronUp, X, XCircle, Save, Plus, Check } from 'lucide-react';
import { FaSave, FaTimes } from 'react-icons/fa';
import bookingService from '../../../data/Service/bookingService';
import { useLoadingWithTimeout } from '../../../hooks/useLoadingWithTimeout';
import { useAsyncData } from '../../../hooks/useAsyncData';
import LoadingPage from '../../../components/LoadingPage';

function BookingManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [expandedRow, setExpandedRow] = useState(null);
    const [expandedContentLoading, setExpandedContentLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null); // Add editing state
    const [formData, setFormData] = useState({
        passengerName: '',
        userEmail: '',
        phoneNumber: '',
        totalPrice: '',
        status: 'pending'
    });

    // Use useAsyncData for initial data fetching
    const {
        data: bookings,
        loading: dataLoading,
        error: dataError,
        refetch: refetchBookings,
        setData: setBookings
    } = useAsyncData(() => bookingService.getAllBookings());

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
        return <LoadingPage message="Loading bookings..." />;
    }

    // Combine error states
    const currentError = dataError || operationError;

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this booking?')) {
            try {
                startLoading();

                await bookingService.deleteBooking(id);

                // Optimistic update
                setBookings(prevBookings => prevBookings.filter(booking => booking.bookingID !== id));

                stopLoading();
            } catch (error) {
                setLoadingError('Failed to delete booking: ' + (error.toString() || 'Unknown error'));
                console.error(error);
                // If delete failed, refetch to ensure data consistency
                await refetchBookings();
            }
        }
    };

    const handleEdit = (booking) => {
        setIsAdding(false);
        setEditingId(booking.bookingID);
        setFormData({
            passengerName: booking.passengerName || '',
            userEmail: booking.userEmail || '',
            phoneNumber: booking.phoneNumber || '',
            totalPrice: booking.totalPrice || '',
            status: booking.status || 'pending'
        });
        setOperationError(null);
    };

    const handleUpdate = async () => {
        try {
            if (!validateForm()) return;

            startLoading();

            const bookingToUpdate = {
                passengerName: formData.passengerName.trim(),
                userEmail: formData.userEmail.trim(),
                phoneNumber: formData.phoneNumber?.trim() || null,
                totalPrice: parseFloat(formData.totalPrice),
                status: formData.status
            };

            const updatedBooking = await bookingService.updateBooking(editingId, bookingToUpdate);

            // Optimistic update
            if (updatedBooking) {
                setBookings(prevBookings =>
                    prevBookings.map(booking =>
                        booking.bookingID === editingId ? updatedBooking : booking
                    )
                );
            } else {
                await refetchBookings();
            }

            // Reset form and state
            setEditingId(null);
            setFormData({
                passengerName: '',
                userEmail: '',
                phoneNumber: '',
                totalPrice: '',
                status: 'pending'
            });

            stopLoading();
        } catch (error) {
            setLoadingError('Failed to update booking: ' + (error.toString() || 'Unknown error'));
            console.error(error);
        }
    };

    const handleViewTickets = async (bookingID) => {
        // If already expanded, close it
        if (expandedRow === bookingID) {
            setExpandedRow(null);
            return;
        }

        try {
            setExpandedRow(bookingID);
            setExpandedContentLoading(true);

            const tickets = await bookingService.getBookingTickets(bookingID);

            // Update the specific booking with tickets
            setBookings(prevBookings =>
                prevBookings.map(booking =>
                    booking.bookingID === bookingID
                        ? { ...booking, tickets }
                        : booking
                )
            );
        } catch (error) {
            console.error('Error fetching booking tickets:', error);
            setOperationError('Failed to load tickets. Please try again later.');
            setExpandedRow(null);
        } finally {
            setExpandedContentLoading(false);
        }
    };

    const handleCloseExpanded = () => {
        setExpandedRow(null);
    };

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            (booking.passengerName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (booking.bookingID?.toString().includes(searchTerm)) ||
            (booking.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus =
            statusFilter === 'All Status' ||
            booking.status?.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        const statusClasses = {
            'pending': 'px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
            'confirmed': 'px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800',
            'cancelled': 'px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800',
            'completed': 'px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
        };

        return (
            <span className={statusClasses[status?.toLowerCase()] || 'px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800'}>
                {status}
            </span>
        );
    };

    const renderExpandedContent = (booking) => {
        if (expandedContentLoading) {
            return (
                <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading tickets...</p>
                </div>
            );
        }

        const tickets = booking.tickets || [];
        if (tickets.length === 0) {
            return <div className="p-4 text-center text-gray-500">No tickets found for this booking.</div>;
        }

        return (
            <div className="p-4 bg-blue-50 rounded-md">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-blue-800">Tickets for Booking #{booking.bookingID}</h3>
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
    };

    const handleAddNew = () => {
        setFormData({
            passengerName: '',
            userEmail: '',
            phoneNumber: '',
            totalPrice: '',
            status: 'pending'
        });
        setIsAdding(true);
        setEditingId(null); // Clear editing state
        setOperationError(null);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null); // Clear editing state
        setOperationError(null);
    };

    const validateForm = () => {
        if (!formData.passengerName?.trim()) {
            setOperationError('Passenger name is required.');
            return false;
        }
        if (!formData.userEmail?.trim()) {
            setOperationError('Email address is required.');
            return false;
        }
        if (!formData.totalPrice || parseFloat(formData.totalPrice) <= 0) {
            setOperationError('Valid total price is required.');
            return false;
        }
        return true;
    };

    const handleSaveNew = async () => {
        try {
            if (!validateForm()) return;

            startLoading();

            const bookingToCreate = {
                passengerName: formData.passengerName.trim(),
                userEmail: formData.userEmail.trim(),
                phoneNumber: formData.phoneNumber?.trim() || null,
                totalPrice: parseFloat(formData.totalPrice),
                status: formData.status,
                bookingDate: new Date().toISOString()
            };

            const newBooking = await bookingService.createBooking(bookingToCreate);

            // Optimistic update
            if (newBooking) {
                setBookings(prevBookings => [...prevBookings, newBooking]);
            } else {
                await refetchBookings();
            }

            // Reset form and state
            setIsAdding(false);
            setFormData({
                passengerName: '',
                userEmail: '',
                phoneNumber: '',
                totalPrice: '',
                status: 'pending'
            });

            stopLoading();
        } catch (error) {
            setLoadingError('Failed to create booking: ' + (error.toString() || 'Unknown error'));
            console.error(error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="p-4 h-screen flex flex-col booking-management relative">
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
                <h1 className="text-2xl font-bold">Booking Management</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={refetchBookings}
                        disabled={isAdding || editingId !== null || operationLoading}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Refresh bookings"
                    >
                        Refresh
                    </button>
                    <button
                        onClick={handleAddNew}
                        disabled={isAdding || editingId !== null || operationLoading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus size={16} className="mr-2" />
                        Add New Booking
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
                                if (dataError) refetchBookings();
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
                    <strong>Bookings:</strong> {bookings.length} |
                    <strong> Filtered:</strong> {filteredBookings.length} |
                    <strong> Last updated:</strong> {new Date().toLocaleTimeString()}
                </p>
            </div>

            <div className="mb-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search bookings..."
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
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
                <table className="min-w-full bg-white">
                    <thead className="sticky top-0 bg-gray-50 z-10">
                        <tr>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Booking ID</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Passenger</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Date</th>
                            <th className="px-4 py-2 border-b border-gray-200 text-left">Total Price</th>
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
                                            name="passengerName"
                                            value={formData.passengerName}
                                            onChange={handleInputChange}
                                            disabled={operationLoading}
                                            className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                            placeholder="Passenger Name*"
                                        />
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        <span className="text-gray-600 text-sm">{new Date().toLocaleDateString()}</span>
                                    </td>
                                    <td className="px-4 py-2 border-b border-gray-200">
                                        <input
                                            type="number"
                                            name="totalPrice"
                                            value={formData.totalPrice}
                                            onChange={handleInputChange}
                                            disabled={operationLoading}
                                            className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                            placeholder="Price*"
                                            min="0"
                                            step="0.01"
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
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="cancelled">Cancelled</option>
                                            <option value="completed">Completed</option>
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
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address*</label>
                                                <input
                                                    type="email"
                                                    name="userEmail"
                                                    value={formData.userEmail}
                                                    onChange={handleInputChange}
                                                    disabled={operationLoading}
                                                    className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                    placeholder="user@example.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                                <input
                                                    type="text"
                                                    name="phoneNumber"
                                                    value={formData.phoneNumber}
                                                    onChange={handleInputChange}
                                                    disabled={operationLoading}
                                                    className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                    placeholder="Phone Number (Optional)"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </>
                        )}
                    </thead>
                    <tbody>
                        {filteredBookings.length > 0 ? (
                            filteredBookings.map(booking => (
                                <React.Fragment key={booking.bookingID}>
                                    <tr className={editingId === booking.bookingID ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                                        <td className="px-4 py-2 border-b border-gray-200 font-bold">{booking.bookingID}</td>
                                        <td className="px-4 py-2 border-b border-gray-200">
                                            {editingId === booking.bookingID ? (
                                                <input
                                                    type="text"
                                                    name="passengerName"
                                                    value={formData.passengerName}
                                                    onChange={handleInputChange}
                                                    disabled={operationLoading}
                                                    className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                    placeholder="Passenger Name*"
                                                />
                                            ) : (
                                                booking.passengerName
                                            )}
                                        </td>
                                        <td className="px-4 py-2 border-b border-gray-200">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                                        <td className="px-4 py-2 border-b border-gray-200">
                                            {editingId === booking.bookingID ? (
                                                <input
                                                    type="number"
                                                    name="totalPrice"
                                                    value={formData.totalPrice}
                                                    onChange={handleInputChange}
                                                    disabled={operationLoading}
                                                    className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                    placeholder="Price*"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            ) : (
                                                new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.totalPrice)
                                            )}
                                        </td>
                                        <td className="px-4 py-2 border-b border-gray-200">
                                            {editingId === booking.bookingID ? (
                                                <select
                                                    name="status"
                                                    value={formData.status}
                                                    onChange={handleInputChange}
                                                    disabled={operationLoading}
                                                    className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="confirmed">Confirmed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                            ) : (
                                                getStatusBadge(booking.status)
                                            )}
                                        </td>
                                        <td className="px-4 py-2 border-b border-gray-200">
                                            <div className="flex justify-center space-x-2">
                                                {editingId === booking.bookingID ? (
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
                                                            onClick={() => handleEdit(booking)}
                                                            disabled={isAdding || editingId !== null || operationLoading}
                                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Edit booking"
                                                        >
                                                            <Edit size={14} className="mr-1" /> Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleViewTickets(booking.bookingID)}
                                                            disabled={isAdding || editingId !== null || operationLoading}
                                                            className={`${expandedRow === booking.bookingID ? 'bg-orange-500 hover:bg-orange-700' : 'bg-purple-500 hover:bg-purple-700'} text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed`}
                                                            title="View tickets"
                                                        >
                                                            <Eye size={14} className="mr-1" />
                                                            {expandedRow === booking.bookingID ?
                                                                <ChevronUp size={14} /> :
                                                                <ChevronDown size={14} />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(booking.bookingID)}
                                                            disabled={isAdding || editingId !== null || operationLoading}
                                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Delete booking"
                                                        >
                                                            <Trash2 size={14} className="mr-1" /> Delete
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    {/* Additional edit form fields row - only show when editing this booking */}
                                    {editingId === booking.bookingID && (
                                        <tr className="bg-yellow-50">
                                            <td colSpan="6" className="px-4 py-2 border-b border-gray-200">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address*</label>
                                                        <input
                                                            type="email"
                                                            name="userEmail"
                                                            value={formData.userEmail}
                                                            onChange={handleInputChange}
                                                            disabled={operationLoading}
                                                            className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                            placeholder="user@example.com"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                                        <input
                                                            type="text"
                                                            name="phoneNumber"
                                                            value={formData.phoneNumber}
                                                            onChange={handleInputChange}
                                                            disabled={operationLoading}
                                                            className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                            placeholder="Phone Number (Optional)"
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {expandedRow === booking.bookingID && (
                                        <tr>
                                            <td colSpan="6" className="p-0 border-b-0">
                                                {renderExpandedContent(booking)}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-4 py-8 border-b border-gray-200 text-center text-gray-500">
                                    No bookings found. Add a new booking to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default BookingManagement;