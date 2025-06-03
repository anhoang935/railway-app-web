import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Ticket, BookOpen, ChevronDown, ChevronUp, X, Check, Plus } from 'lucide-react';
import { FaSave, FaTimes } from 'react-icons/fa';
import passengerService from '../../../data/Service/passengerService';
import LoadingSpinner from '../Components/LoadingSpinner';
import './PassengerManagement.css';

function PassengerManagement() {
    const [passengers, setPassengers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [expandedRow, setExpandedRow] = useState(null);
    const [expandedContent, setExpandedContent] = useState(null);
    const [expandedContentLoading, setExpandedContentLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        phone_number: '',
        id_number: '',
        address: '',
        status: 'active'
    });

    useEffect(() => {
        fetchPassengers();
    }, []);

    const fetchPassengers = async () => {
        try {
            setLoading(true);
            const data = await passengerService.getAllPassengers();
            setPassengers(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching passengers:', err);
            setError('Failed to load passengers. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this passenger?')) {
            try {
                await passengerService.deletePassenger(id);
                setPassengers(passengers.filter(passenger => passenger.passengerID !== id));
            } catch (err) {
                console.error('Error deleting passenger:', err);
                alert('Failed to delete passenger. Please try again later.');
            }
        }
    };

    const handleEdit = (id) => {
        console.log('Edit passenger', id);
        // Implement edit functionality
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
            setPassengers(passengers.map(passenger =>
                passenger.passengerID === passengerID
                    ? { ...passenger, tickets }
                    : passenger
            ));
        } catch (err) {
            console.error('Error fetching passenger tickets:', err);
            alert('Failed to load tickets. Please try again later.');
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
            setPassengers(passengers.map(passenger =>
                passenger.passengerID === passengerID
                    ? { ...passenger, bookings }
                    : passenger
            ));
        } catch (err) {
            console.error('Error fetching passenger bookings:', err);
            alert('Failed to load bookings. Please try again later.');
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
                    <LoadingSpinner />
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
    };

    const handleCancel = () => {
        setIsAdding(false);
    };

    const handleSaveNew = async () => {
        try {
            // Validate the form
            if (!formData.fullname || !formData.email || !formData.phone_number) {
                alert('Please fill in all required fields.');
                return;
            }

            // Create the new passenger
            const newPassenger = await passengerService.createPassenger({
                fullname: formData.fullname,
                email: formData.email,
                phone_number: formData.phone_number,
                id_number: formData.id_number,
                address: formData.address,
                status: formData.status
            });

            // Update the list with the new passenger
            setPassengers([...passengers, newPassenger]);

            // Reset the form and exit adding mode
            setIsAdding(false);
            setFormData({
                fullname: '',
                email: '',
                phone_number: '',
                id_number: '',
                address: '',
                status: 'active'
            });

        } catch (error) {
            console.error('Error creating passenger:', error);
            alert('Failed to create passenger. Please try again.');
        }
    };

    if (loading) {
        return <div className="p-4 flex justify-center"><LoadingSpinner /></div>;
    }

    if (error) {
        return <div className="p-4 text-red-500 text-center">{error}</div>;
    }

    return (
        <div className="p-4 h-screen flex flex-col passenger-management">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Passenger Management</h1>
                <button
                    onClick={handleAddNew}
                    disabled={isAdding}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="mr-2">+</span>
                    Add New Passenger
                </button>
            </div>

            <div className="search-filter-container">
                <div className="search-input-container">
                    <input
                        type="text"
                        placeholder="Search passengers..."
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
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                </select>
            </div>

            <div className="flex-1 overflow-auto passenger-table-container">
                <table className="min-w-full bg-white passenger-table">
                    <thead>
                        <tr>
                            <th>Passenger ID</th>
                            <th>Full Name</th>
                            <th>Phone</th>
                            <th>Email</th>
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
                                        name="fullname"
                                        value={formData.fullname}
                                        onChange={handleInputChange}
                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                        placeholder="Full Name"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={handleInputChange}
                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                        placeholder="Phone Number"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                        placeholder="Email Address"
                                    />
                                </td>
                                <td>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="pending">Pending</option>
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

                        {/* Hidden row for additional fields */}
                        {isAdding && (
                            <tr className="bg-blue-50">
                                <td colSpan="6" className="px-4 py-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">ID Number</label>
                                            <input
                                                type="text"
                                                name="id_number"
                                                value={formData.id_number}
                                                onChange={handleInputChange}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                placeholder="ID Number"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Address</label>
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                                rows="2"
                                                placeholder="Address"
                                            />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Existing passenger rows - keep this part */}
                        {filteredPassengers.map(passenger => (
                            <React.Fragment key={passenger.passengerID}>
                                <tr>
                                    <td>{passenger.passengerID}</td>
                                    <td>{passenger.fullname}</td>
                                    <td>{passenger.phone_number}</td>
                                    <td>{passenger.email}</td>
                                    <td>{getStatusBadge(passenger.status)}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                onClick={() => handleEdit(passenger.passengerID)}
                                                className="btn-edit"
                                                title="Edit passenger"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleViewTickets(passenger.passengerID)}
                                                className={`btn-tickets ${expandedRow === passenger.passengerID && expandedContent === 'tickets' ? 'active' : ''}`}
                                                title="View tickets"
                                            >
                                                <Ticket size={14} />
                                                {expandedRow === passenger.passengerID && expandedContent === 'tickets' ?
                                                    <ChevronUp size={14} className="ml-1" /> :
                                                    <ChevronDown size={14} className="ml-1" />}
                                            </button>
                                            <button
                                                onClick={() => handleViewBookings(passenger.passengerID)}
                                                className={`btn-bookings ${expandedRow === passenger.passengerID && expandedContent === 'bookings' ? 'active' : ''}`}
                                                title="View bookings"
                                            >
                                                <BookOpen size={14} />
                                                {expandedRow === passenger.passengerID && expandedContent === 'bookings' ?
                                                    <ChevronUp size={14} className="ml-1" /> :
                                                    <ChevronDown size={14} className="ml-1" />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(passenger.passengerID)}
                                                className="btn-delete"
                                                title="Delete passenger"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {expandedRow === passenger.passengerID && (
                                    <tr className="expanded-row">
                                        <td colSpan="6" className="p-0 border-b-0">
                                            {renderExpandedContent(passenger)}
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

export default PassengerManagement;