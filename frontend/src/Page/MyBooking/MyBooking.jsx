import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Train, 
    Calendar, 
    Clock, 
    MapPin, 
    User, 
    CreditCard,
    Eye,
    X,
    AlertCircle,
    CheckCircle,
    XCircle,
    RefreshCw,
    Ban
} from 'lucide-react';
import authService from '../../data/Service/authService';
import bookingService from '../../data/Service/bookingService';
import './MyBooking.css';

const MyBooking = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const checkAuthAndFetchBookings = async () => {
            try {
                setLoading(true);
                
                // Check authentication
                const isAuth = authService.isAuthenticated();
                const user = authService.getCurrentUser();
                
                console.log('MyBooking - Auth check:', { isAuth, user });
                
                if (!isAuth || !user) {
                    console.log('MyBooking - Not authenticated, redirecting to login');
                    navigate('/login');
                    return;
                }
                
                setCurrentUser(user);
                
                // Fetch user's bookings and stats
                const [userBookings, userStats] = await Promise.all([
                    bookingService.getBookingsByUser(user.userId),
                    bookingService.getUserBookingStats(user.userId)
                ]);
                
                setBookings(userBookings);
                setStats(userStats);
                
            } catch (error) {
                console.error('Error fetching bookings:', error);
                setError('Failed to load your bookings. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        checkAuthAndFetchBookings();
    }, [navigate]);

    const handleRefresh = async () => {
        if (!currentUser) return;
        
        try {
            setLoading(true);
            setError(null);
            
            const [userBookings, userStats] = await Promise.all([
                bookingService.getBookingsByUser(currentUser.userID),
                bookingService.getUserBookingStats(currentUser.userID)
            ]);
            
            setBookings(userBookings);
            setStats(userStats);
        } catch (error) {
            console.error('Error refreshing bookings:', error);
            setError('Failed to refresh bookings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (booking) => {
        try {
            setLoading(true);
            // Fetch detailed booking information
            const detailedBooking = await bookingService.getBookingDetails(booking.bookingID);
            
            setSelectedBooking(detailedBooking);
            setShowDetails(true);
        } catch (error) {
            console.error('Error fetching booking details:', error);
            setError('Failed to load booking details.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        try {
            setLoading(true);
            await bookingService.cancelBooking(bookingId, currentUser.userID);
            
            // Update the booking in the list
            setBookings(prevBookings => 
                prevBookings.map(booking => 
                    booking.bookingID === bookingId 
                        ? { ...booking, status: 'cancelled' }
                        : booking
                )
            );
            
            // Refresh stats
            const userStats = await bookingService.getUserBookingStats(currentUser.userID);
            setStats(userStats);
            
        } catch (error) {
            console.error('Error cancelling booking:', error);
            setError('Failed to cancel booking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { 
                class: 'bg-yellow-100 text-yellow-800', 
                icon: <AlertCircle size={14} />
            },
            'confirmed': { 
                class: 'bg-green-100 text-green-800', 
                icon: <CheckCircle size={14} />
            },
            'cancelled': { 
                class: 'bg-red-100 text-red-800', 
                icon: <XCircle size={14} />
            },
            'completed': { 
                class: 'bg-blue-100 text-blue-800', 
                icon: <CheckCircle size={14} />
            }
        };

        const config = statusConfig[status?.toLowerCase()] || statusConfig['pending'];
        
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
                {config.icon}
                {status || 'Pending'}
            </span>
        );
    };

    const renderStatsCards = () => {
        if (!stats) return null;

        return (
            <div className="stats-grid mb-6">
                <div className="stat-card">
                    <div className="stat-icon">
                        <CreditCard size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.totalBookings || 0}</div>
                        <div className="stat-label">Total Bookings</div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon confirmed">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.confirmedBookings || 0}</div>
                        <div className="stat-label">Confirmed</div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon pending">
                        <AlertCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.pendingBookings || 0}</div>
                        <div className="stat-label">Pending</div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">
                        <Train size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{formatCurrency(stats.totalSpent || 0)}</div>
                        <div className="stat-label">Total Spent</div>
                    </div>
                </div>
            </div>
        );
    };

    const renderBookingCard = (booking) => (
        <div key={booking.bookingID} className="booking-card">
            <div className="booking-header">
                <div className="booking-id">
                    <h3>Booking #{booking.bookingID}</h3>
                    {getStatusBadge(booking.status)}
                </div>
                <div className="booking-actions">
                    <button 
                        onClick={() => handleViewDetails(booking)}
                        className="view-details-btn"
                        disabled={loading}
                    >
                        <Eye size={16} />
                        View Details
                    </button>
                    {booking.status === 'pending' && (
                        <button 
                            onClick={() => handleCancelBooking(booking.bookingID)}
                            className="cancel-btn"
                            disabled={loading}
                        >
                            <Ban size={16} />
                            Cancel
                        </button>
                    )}
                </div>
            </div>
            
            <div className="booking-info">
                <div className="info-item">
                    <Calendar className="info-icon" />
                    <span>Booking Date: {formatDate(booking.bookingDate)}</span>
                </div>
                
                <div className="info-item">
                    <User className="info-icon" />
                    <span>Passenger: {booking.passengerName}</span>
                </div>
                
                <div className="info-item">
                    <CreditCard className="info-icon" />
                    <span>Total: {formatCurrency(booking.totalPrice)}</span>
                </div>
            </div>
        </div>
    );

    const renderBookingDetails = () => {
        if (!selectedBooking) return null;

        return (
            <div className="booking-details-modal">
                <div className="modal-overlay" onClick={() => setShowDetails(false)} />
                <div className="modal-content">
                    <div className="modal-header">
                        <h2>Booking Details #{selectedBooking.bookingID}</h2>
                        <button 
                            onClick={() => setShowDetails(false)}
                            className="close-btn"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="modal-body">
                        {/* Booking Information */}
                        <div className="details-section">
                            <h3>Booking Information</h3>
                            <div className="details-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Booking ID:</span>
                                    <span className="detail-value">#{selectedBooking.bookingID}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Status:</span>
                                    <span className="detail-value">{getStatusBadge(selectedBooking.status)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Booking Date:</span>
                                    <span className="detail-value">{formatDate(selectedBooking.bookingDate)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Total Price:</span>
                                    <span className="detail-value">{formatCurrency(selectedBooking.totalPrice)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Passenger Information */}
                        <div className="details-section">
                            <h3>Passenger Information</h3>
                            <div className="details-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Name:</span>
                                    <span className="detail-value">{selectedBooking.passengerName}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Email:</span>
                                    <span className="detail-value">{selectedBooking.passengerEmail}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Phone:</span>
                                    <span className="detail-value">{selectedBooking.passengerPhone}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tickets Information */}
                        {selectedBooking.tickets && selectedBooking.tickets.length > 0 && (
                            <div className="details-section">
                                <h3>Tickets</h3>
                                <div className="tickets-list">
                                    {selectedBooking.tickets.map((ticket, index) => (
                                        <div key={ticket.ticketID || index} className="ticket-item">
                                            <div className="ticket-header">
                                                <Train size={16} />
                                                <span>Ticket #{ticket.ticketID}</span>
                                            </div>
                                            <div className="ticket-details">
                                                <div className="route-info">
                                                    <div className="station">
                                                        <MapPin size={14} />
                                                        <span>{ticket.departureStation}</span>
                                                    </div>
                                                    <div className="arrow">→</div>
                                                    <div className="station">
                                                        <MapPin size={14} />
                                                        <span>{ticket.arrivalStation}</span>
                                                    </div>
                                                </div>
                                                <div className="journey-details">
                                                    <div className="detail">
                                                        <Calendar size={14} />
                                                        <span>{formatDate(ticket.departureDate)}</span>
                                                    </div>
                                                    <div className="detail">
                                                        <Clock size={14} />
                                                        <span>{formatTime(ticket.departureTime)}</span>
                                                    </div>
                                                    <div className="detail">
                                                        <span>Seat: {ticket.seatNumber}</span>
                                                    </div>
                                                    <div className="detail">
                                                        <span>Coach: {ticket.coachType}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Show loading spinner - similar to Settings page
    if (loading) {
        return (
            <div className="fixed inset-0 bg-white z-50 flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <span className="block mt-3 text-gray-600">Loading your bookings...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="my-booking-container">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
                <p className="text-gray-600">View and manage your train ticket bookings</p>
            </div>

            {/* Refresh Button */}
            <div className="flex justify-end mb-6">
                <button onClick={handleRefresh} className="refresh-btn" disabled={loading}>
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="error-message">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            {/* Statistics Cards */}
            {renderStatsCards()}

            {/* Content */}
            <div className="bookings-content">
                {bookings.length === 0 ? (
                    <div className="empty-state">
                        <Train size={48} className="empty-icon" />
                        <h3>No Bookings Found</h3>
                        <p>You haven't made any bookings yet.</p>
                        <button 
                            onClick={() => navigate('/buy-ticket')}
                            className="book-now-btn"
                        >
                            Book Your First Ticket
                        </button>
                    </div>
                ) : (
                    <div className="bookings-grid">
                        {bookings.map(renderBookingCard)}
                    </div>
                )}
            </div>

            {showDetails && renderBookingDetails()}
        </div>
    );
};

export default MyBooking;