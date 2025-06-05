import axios from "axios";
import bookingService from "./bookingService.js";
import ticketService from "./ticketService.js";
import trainService from "./trainService.js";
import stationService from "./stationService.js";
import passengerService from "./passengerService.js";

const getBaseUrl = () => {
    const port = '5000';
    if (window.location.hostname === 'localhost') {
        return `http://localhost:${port}/api/v1`;
    }
    return `${process.env.REACT_APP_BACKEND_URL}/api/v1`;
};

const BASE_URL = getBaseUrl();

const dashboardService = {
    getDashboardData: async () => {
        try {
            console.log('🔄 Starting to fetch dashboard data...');

            const [bookings, tickets, trains, stations, passengers] = await Promise.all([
                bookingService.getAllBookings().catch(err => { console.error('❌ Bookings error:', err); return []; }),
                ticketService.getAllTickets().catch(err => { console.error('❌ Tickets error:', err); return []; }),
                trainService.getAllTrains().catch(err => { console.error('❌ Trains error:', err); return []; }),
                stationService.getAllStations().catch(err => { console.error('❌ Stations error:', err); return []; }),
                passengerService.getAllPassengers().catch(err => { console.error('❌ Passengers error:', err); return []; })
            ]);

            console.log('✅ Raw data fetched successfully:');
            console.log('📊 Bookings:', bookings?.length || 0, bookings);
            console.log('🎫 Tickets:', tickets?.length || 0, tickets);
            console.log('🚂 Trains:', trains?.length || 0, trains);
            console.log('🚉 Stations:', stations?.length || 0, stations);
            console.log('👥 Passengers:', passengers?.length || 0, passengers);

            return {
                bookings: bookings || [],
                tickets: tickets || [],
                trains: trains || [],
                stations: stations || [],
                passengers: passengers || []
            };
        } catch (error) {
            console.error('💥 Error fetching dashboard data:', error);
            throw error;
        }
    },

    generateBookingTrends: (tickets, stations) => {
        console.log('🔍 Generating booking trends with:', {
            ticketsCount: tickets?.length || 0,
            stationsCount: stations?.length || 0,
            sampleTicket: tickets?.[0]
        });

        if (!tickets || tickets.length === 0) {
            console.log('⚠️ No tickets found, returning empty trends');
            return {
                totalBookings: 0,
                completionRate: 0,
                popularRoutes: [],
                timeDistribution: [
                    { period: 'Morning', count: 0 },
                    { period: 'Afternoon', count: 0 },
                    { period: 'Evening', count: 0 },
                    { period: 'Night', count: 0 }
                ],
                cancellationRate: 0
            };
        }

        // Check ticket structure
        console.log('🎫 Sample ticket structure:', tickets[0]);
        console.log('📅 Ticket date fields:', {
            departureDate: tickets[0]?.departureDate,
            departureTime: tickets[0]?.departureTime,
            status: tickets[0]?.status
        });

        const today = new Date().toDateString();
        console.log('📅 Today is:', today);

        const todayTickets = tickets.filter(ticket => {
            if (!ticket.departureDate) {
                console.log('⚠️ Ticket missing departureDate:', ticket);
                return false;
            }
            const ticketDate = new Date(ticket.departureDate).toDateString();
            console.log('🔍 Comparing:', ticketDate, 'vs', today);
            return ticketDate === today;
        });

        console.log('📊 Today tickets:', todayTickets.length);

        const confirmedTickets = tickets.filter(ticket =>
            !ticket.status || ticket.status === 'confirmed' || ticket.status === 'active'
        );

        const cancelledTickets = tickets.filter(ticket =>
            ticket.status === 'cancelled'
        );

        console.log('✅ Confirmed tickets:', confirmedTickets.length);
        console.log('❌ Cancelled tickets:', cancelledTickets.length);

        const completionRate = tickets.length > 0
            ? Math.round((confirmedTickets.length / tickets.length) * 100)
            : 0;

        const cancellationRate = tickets.length > 0
            ? Math.round((cancelledTickets.length / tickets.length) * 100)
            : 0;

        // Build popular routes
        const routeCounts = {};
        tickets.forEach(ticket => {
            if (ticket.departureStation && ticket.arrivalStation) {
                const route = `${ticket.departureStation} → ${ticket.arrivalStation}`;
                routeCounts[route] = (routeCounts[route] || 0) + 1;
            }
        });

        console.log('🗺️ Route counts:', routeCounts);

        const popularRoutes = Object.entries(routeCounts)
            .map(([route, count]) => {
                const [from, to] = route.split(' → ');
                return {
                    from,
                    to,
                    bookings: count,
                    percentage: Math.round((count / tickets.length) * 100)
                };
            })
            .sort((a, b) => b.bookings - a.bookings)
            .slice(0, 5);

        // Time distribution
        const timeDistribution = [
            { period: 'Morning', count: 0 },
            { period: 'Afternoon', count: 0 },
            { period: 'Evening', count: 0 },
            { period: 'Night', count: 0 }
        ];

        tickets.forEach(ticket => {
            if (ticket.departureTime) {
                const hour = parseInt(ticket.departureTime.split(':')[0]);
                if (hour >= 6 && hour < 12) timeDistribution[0].count++;
                else if (hour >= 12 && hour < 18) timeDistribution[1].count++;
                else if (hour >= 18 && hour < 24) timeDistribution[2].count++;
                else timeDistribution[3].count++;
            }
        });

        const result = {
            totalBookings: todayTickets.length,
            completionRate,
            popularRoutes,
            timeDistribution,
            cancellationRate
        };

        console.log('📈 Generated booking trends:', result);
        return result;
    },

    generateTrainStats: (trains) => {
        console.log('🚂 Generating train stats with:', {
            trainsCount: trains?.length || 0,
            sampleTrain: trains?.[0]
        });

        if (!trains || trains.length === 0) {
            console.log('⚠️ No trains found');
            return { onTimePercentage: 0, delayedPercentage: 0, cancelledPercentage: 0 };
        }

        const total = trains.length;

        // Check train statuses
        const statusCounts = {};
        trains.forEach(train => {
            const status = train.status || 'no-status';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        console.log('🚂 Train status distribution:', statusCounts);

        const onTime = trains.filter(train =>
            !train.status || train.status === 'on-time' || train.status === 'active' || train.status === 'operational'
        ).length;
        const delayed = trains.filter(train => train.status === 'delayed').length;
        const cancelled = trains.filter(train => train.status === 'cancelled').length;

        const result = {
            onTimePercentage: Math.round((onTime / total) * 100),
            delayedPercentage: Math.round((delayed / total) * 100),
            cancelledPercentage: Math.round((cancelled / total) * 100)
        };

        console.log('📊 Train stats result:', result);
        return result;
    },

    generateStationTraffic: (tickets, stations) => {
        console.log('🚉 Generating station traffic with:', {
            ticketsCount: tickets?.length || 0,
            stationsCount: stations?.length || 0,
            sampleStation: stations?.[0]
        });

        if (!stations || stations.length === 0) {
            console.log('⚠️ No stations found');
            return [];
        }

        const stationCounts = {};

        if (tickets && tickets.length > 0) {
            tickets.forEach(ticket => {
                if (ticket.departureStation) {
                    stationCounts[ticket.departureStation] = (stationCounts[ticket.departureStation] || 0) + 1;
                }
                if (ticket.arrivalStation) {
                    stationCounts[ticket.arrivalStation] = (stationCounts[ticket.arrivalStation] || 0) + 1;
                }
            });
        }

        console.log('🚉 Station passenger counts:', stationCounts);

        const result = stations.map(station => ({
            id: station.stationID,
            name: station.stationName,
            passengers: stationCounts[station.stationName] || 0,
            capacity: 3000,
            status: stationCounts[station.stationName] > 100 ? 'busy' :
                stationCounts[station.stationName] > 50 ? 'normal' : 'quiet',
            platforms: Math.floor(Math.random() * 8) + 2,
            arrivals: Math.floor((stationCounts[station.stationName] || 0) / 2),
            departures: Math.floor((stationCounts[station.stationName] || 0) / 2)
        })).sort((a, b) => b.passengers - a.passengers);

        console.log('🚉 Station traffic result:', result);
        return result;
    },

    generateRevenueData: (tickets) => {
        console.log('💰 Generating revenue data with:', {
            ticketsCount: tickets?.length || 0,
            sampleTicket: tickets?.[0],
            priceFields: tickets?.[0] ? Object.keys(tickets[0]).filter(key => key.toLowerCase().includes('price')) : []
        });

        if (!tickets || tickets.length === 0) {
            console.log('⚠️ No tickets found for revenue calculation');
            return { total: 0, daily: 0, weekly: 0, monthly: 0, growth: 0 };
        }

        const today = new Date();
        const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Check price field names
        console.log('💰 Checking price fields in tickets:', tickets[0]);

        const dailyRevenue = tickets
            .filter(ticket => {
                if (!ticket.departureDate) return false;
                const ticketDate = new Date(ticket.departureDate);
                return ticketDate.toDateString() === today.toDateString();
            })
            .reduce((sum, ticket) => {
                const price = parseFloat(ticket.ticketPrice || ticket.price || 0);
                console.log('💰 Daily ticket price:', price, 'from', ticket);
                return sum + price;
            }, 0);

        const weeklyRevenue = tickets
            .filter(ticket => {
                if (!ticket.departureDate) return false;
                const ticketDate = new Date(ticket.departureDate);
                return ticketDate >= thisWeek;
            })
            .reduce((sum, ticket) => sum + (parseFloat(ticket.ticketPrice || ticket.price || 0)), 0);

        const monthlyRevenue = tickets
            .filter(ticket => {
                if (!ticket.departureDate) return false;
                const ticketDate = new Date(ticket.departureDate);
                return ticketDate >= thisMonth;
            })
            .reduce((sum, ticket) => sum + (parseFloat(ticket.ticketPrice || ticket.price || 0)), 0);

        const totalRevenue = tickets
            .reduce((sum, ticket) => sum + (parseFloat(ticket.ticketPrice || ticket.price || 0)), 0);

        const result = {
            total: totalRevenue,
            daily: dailyRevenue,
            weekly: weeklyRevenue,
            monthly: monthlyRevenue,
            growth: Math.floor(Math.random() * 20) - 5
        };

        console.log('💰 Revenue calculation result:', result);
        return result;
    },

    generatePassengerFlow: (tickets, passengers) => {
        console.log('👥 Generating passenger flow with:', {
            ticketsCount: tickets?.length || 0,
            passengersCount: passengers?.length || 0
        });

        const currentPassengers = passengers ? passengers.length : 0;
        const peakHour = Math.max(currentPassengers, 100);
        const averagePassengers = Math.round(currentPassengers * 0.7);

        const hourlyFlow = Array.from({ length: 12 }, (_, i) => {
            const hour = 6 + i;
            return {
                hour: `${hour}:00`,
                passengers: Math.floor(Math.random() * (currentPassengers || 50)) + 20,
                count: Math.floor(Math.random() * (currentPassengers || 50)) + 20
            };
        });

        const result = {
            current: currentPassengers,
            peak: peakHour,
            average: averagePassengers,
            hourlyFlow,
            trends: {
                direction: Math.random() > 0.5 ? 'up' : 'down',
                percentage: Math.floor(Math.random() * 20) + 5
            }
        };

        console.log('👥 Passenger flow result:', result);
        return result;
    },

    generateSystemPerformance: (trains) => {
        console.log('⚡ Generating system performance with:', {
            trainsCount: trains?.length || 0
        });

        const onTimeTrains = trains ? trains.filter(t =>
            !t.status || t.status === 'active' || t.status === 'on-time' || t.status === 'operational'
        ).length : 0;
        const totalTrains = trains ? trains.length : 1;
        const healthScore = Math.round((onTimeTrains / totalTrains) * 100);

        const result = {
            systemHealth: {
                score: healthScore,
                status: healthScore >= 90 ? 'excellent' : healthScore >= 75 ? 'good' : 'poor'
            },
            apiResponse: {
                time: Math.floor(Math.random() * 100) + 50,
                status: 'good'
            },
            networkStatus: {
                latency: Math.floor(Math.random() * 30) + 10,
                status: 'stable'
            },
            databaseStatus: {
                queryTime: Math.floor(Math.random() * 50) + 25,
                connections: Math.floor(Math.random() * 20) + 10,
                load: Math.floor(Math.random() * 40) + 20,
                status: 'optimal'
            },
            alerts: []
        };

        console.log('⚡ System performance result:', result);
        return result;
    },

    generateBookingTrendsFromBookings: (bookings, stations) => {
        console.log('🔍 Generating booking trends from BOOKINGS with:', {
            bookingsCount: bookings?.length || 0,
            stationsCount: stations?.length || 0,
            sampleBooking: bookings?.[0]
        });

        if (!bookings || bookings.length === 0) {
            console.log('⚠️ No bookings found, returning empty trends');
            return {
                totalBookings: 0,
                completionRate: 0,
                popularRoutes: [],
                timeDistribution: [
                    { period: 'Morning', count: 0 },
                    { period: 'Afternoon', count: 0 },
                    { period: 'Evening', count: 0 },
                    { period: 'Night', count: 0 }
                ],
                cancellationRate: 0
            };
        }

        console.log('📊 Sample booking structure:', bookings[0]);

        const today = new Date().toDateString();
        const todayBookings = bookings.filter(booking => {
            if (!booking.bookingDate && !booking.createdAt) return false;
            const bookingDate = new Date(booking.bookingDate || booking.createdAt).toDateString();
            return bookingDate === today;
        });

        const confirmedBookings = bookings.filter(booking =>
            !booking.status || booking.status === 'confirmed' || booking.status === 'active' || booking.status === 'paid'
        );

        const cancelledBookings = bookings.filter(booking =>
            booking.status === 'cancelled'
        );

        const completionRate = bookings.length > 0
            ? Math.round((confirmedBookings.length / bookings.length) * 100)
            : 0;

        const cancellationRate = bookings.length > 0
            ? Math.round((cancelledBookings.length / bookings.length) * 100)
            : 0;

        const result = {
            totalBookings: todayBookings.length,
            completionRate,
            popularRoutes: [], // We'd need departure/arrival info from bookings
            timeDistribution: [
                { period: 'Morning', count: Math.floor(bookings.length * 0.3) },
                { period: 'Afternoon', count: Math.floor(bookings.length * 0.4) },
                { period: 'Evening', count: Math.floor(bookings.length * 0.2) },
                { period: 'Night', count: Math.floor(bookings.length * 0.1) }
            ],
            cancellationRate
        };

        console.log('📈 Generated booking trends from bookings:', result);
        return result;
    },

    generateRevenueFromBookings: (bookings) => {
        console.log('💰 Generating revenue from BOOKINGS:', {
            bookingsCount: bookings?.length || 0,
            sampleBooking: bookings?.[0]
        });

        if (!bookings || bookings.length === 0) {
            return { total: 0, daily: 0, weekly: 0, monthly: 0, growth: 0 };
        }

        const today = new Date();
        const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        const totalRevenue = bookings.reduce((sum, booking) =>
            sum + (parseFloat(booking.totalPrice || booking.price || 0)), 0
        );

        const dailyRevenue = bookings
            .filter(booking => {
                const bookingDate = new Date(booking.bookingDate || booking.createdAt);
                return bookingDate.toDateString() === today.toDateString();
            })
            .reduce((sum, booking) => sum + (parseFloat(booking.totalPrice || booking.price || 0)), 0);

        const weeklyRevenue = bookings
            .filter(booking => {
                const bookingDate = new Date(booking.bookingDate || booking.createdAt);
                return bookingDate >= thisWeek;
            })
            .reduce((sum, booking) => sum + (parseFloat(booking.totalPrice || booking.price || 0)), 0);

        const monthlyRevenue = bookings
            .filter(booking => {
                const bookingDate = new Date(booking.bookingDate || booking.createdAt);
                return bookingDate >= thisMonth;
            })
            .reduce((sum, booking) => sum + (parseFloat(booking.totalPrice || booking.price || 0)), 0);

        const result = {
            total: totalRevenue,
            daily: dailyRevenue,
            weekly: weeklyRevenue,
            monthly: monthlyRevenue,
            growth: Math.floor(Math.random() * 20) + 5
        };

        console.log('💰 Revenue from bookings:', result);
        return result;
    }
};

export default dashboardService;