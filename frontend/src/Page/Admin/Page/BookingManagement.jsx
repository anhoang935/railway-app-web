import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Eye, ChevronDown, ChevronUp, X, XCircle, Save, Plus, Check } from 'lucide-react';
import { FaSave, FaTimes } from 'react-icons/fa';
import bookingService from '../../../data/Service/bookingService';
import LoadingSpinner from '../Components/LoadingSpinner';
import './BookingManagement.css';

function BookingManagement() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [expandedRow, setExpandedRow] = useState(null);
    const [expandedContentLoading, setExpandedContentLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        passengerName: '',
        userEmail: '',
        phoneNumber: '',
        totalPrice: '',
        status: 'pending'
    });

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const data = await bookingService.getAllBookings();
            setBookings(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError('Failed to load bookings. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this booking?')) {
            try {
                await bookingService.deleteBooking(id);
                setBookings(bookings.filter(booking => booking.bookingID !== id));
            } catch (err) {
                console.error('Error deleting booking:', err);
                alert('Failed to delete booking. Please try again later.');
            }
        }
    };

    const handleEdit = (id) => {
        console.log('Edit booking', id);
        // Implement edit functionality
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
            setBookings(bookings.map(booking =>
                booking.bookingID === bookingID
                    ? { ...booking, tickets }
                    : booking
            ));
        } catch (err) {
            console.error('Error fetching booking tickets:', err);
            alert('Failed to load tickets. Please try again later.');
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
            'pending': 'status-badge status-pending',
            'confirmed': 'status-badge status-confirmed',
            'cancelled': 'status-badge status-cancelled',
            'completed': 'status-badge status-completed'
        };

        return (
            <span className={statusClasses[status?.toLowerCase()] || 'status-badge bg-gray-100 text-gray-800'}>
                {status}
            </span>
        );
    };

    const renderExpandedContent = (booking) => {
        if (expandedContentLoading) {
            return (
                <div className="p-4 text-center">
                    <LoadingSpinner />
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
    };

    const handleCancel = () => {
        setIsAdding(false);
    };

    const handleSaveNew = async () => {
        try {
            // Validate the form
            if (!formData.passengerName || !formData.userEmail || !formData.totalPrice) {
                alert('Please fill in all required fields.');
                return;
            }

            // Create the new booking
            const newBooking = await bookingService.createBooking({
                passengerName: formData.passengerName,
                userEmail: formData.userEmail,
                phoneNumber: formData.phoneNumber,
                totalPrice: parseFloat(formData.totalPrice),
                status: formData.status,
                bookingDate: new Date().toISOString()
            });

            // Update the list with the new booking
            setBookings([...bookings, newBooking]);

            // Reset the form and exit adding mode
            setIsAdding(false);
            setFormData({
                passengerName: '',
                userEmail: '',
                phoneNumber: '',
                totalPrice: '',
                status: 'pending'
            });

        } catch (error) {
            console.error('Error creating booking:', error);
            alert('Failed to create booking. Please try again.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return <div className="p-4 flex justify-center"><LoadingSpinner /></div>;
    }

    if (error) {
        return <div className="p-4 text-red-500 text-center">{error}</div>;
    }

    return (
        <div className="p-4 h-screen flex flex-col booking-management">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Booking Management</h1>
                <button
                    onClick={handleAddNew}
                    disabled={isAdding}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="mr-2">+</span>
                    Add New Booking
                </button>
            </div>

            <div className="search-filter-container">
                <div className="search-input-container">
                    <input
                        type="text"
                        placeholder="Search bookings..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="search-icon">🔍</span>
                </div>

                <select
                    className="filter-select"
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

            <div className="flex-1 overflow-auto booking-table-container">
                <table className="min-w-full bg-white booking-table">
                    <thead>
                        <tr>
                            <th>Booking ID</th>
                            <th>Passenger</th>
                            <th>Date</th>
                            <th>Total Price</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Add New Row Form */}
                        {isAdding && (
                            <tr className="bg-blue-50">
                                <td>Auto-generated</td>
                                <td>
                                    <input
                                        type="text"
                                        name="passengerName"
                                        value={formData.passengerName}
                                        onChange={handleInputChange}
                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                        placeholder="Passenger Name"
                                    />
                                </td>
                                <td>
                                    {new Date().toLocaleDateString()}
                                </td>
                                <td>
                                    <div className="flex items-center">
                                        <input
                                            type="number"
                                            name="totalPrice"
                                            value={formData.totalPrice}
                                            onChange={handleInputChange}
                                            className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                            placeholder="Price"
                                        />
                                    </div>
                                </td>
                                <td>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </td>
                                <td>
                                    <div className="flex space-x-2 justify-center">
                                        <button
                                            onClick={handleSaveNew}
                                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center font-bold transition-colors duration-200"
                                        >
                                            <FaSave className="mr-1" /> Save
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded flex items-center font-bold transition-colors duration-200"
                                        >
                                            <FaTimes className="mr-1" /> Cancel
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Hidden row for email and phone fields */}
                        {isAdding && (
                            <tr className="bg-blue-50">
                                <td colSpan="6" className="px-4 py-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email*</label>
                                            <input
                                                type="email"
                                                name="userEmail"
                                                value={formData.userEmail}
                                                onChange={handleInputChange}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                placeholder="Email Address"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                            <input
                                                type="text"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleInputChange}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                placeholder="Phone Number"
                                            />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Existing booking rows - keep this part */}
                        {filteredBookings.map(booking => (
                            <React.Fragment key={booking.bookingID}>
                                <tr>
                                    <td>{booking.bookingID}</td>
                                    <td>{booking.passengerName}</td>
                                    <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                                    <td>
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.totalPrice)}
                                    </td>
                                    <td>{getStatusBadge(booking.status)}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                onClick={() => handleEdit(booking.bookingID)}
                                                className="btn-edit"
                                                title="Edit booking"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleViewTickets(booking.bookingID)}
                                                className={`btn-view ${expandedRow === booking.bookingID ? 'active' : ''}`}
                                                title="View tickets"
                                            >
                                                <Eye size={14} />
                                                {expandedRow === booking.bookingID ?
                                                    <ChevronUp size={14} className="ml-1" /> :
                                                    <ChevronDown size={14} className="ml-1" />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(booking.bookingID)}
                                                className="btn-delete"
                                                title="Delete booking"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {expandedRow === booking.bookingID && (
                                    <tr className="expanded-row">
                                        <td colSpan="6" className="p-0 border-b-0">
                                            {renderExpandedContent(booking)}
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default BookingManagement;