import pool from '../Config/db.js';

class Tickets {

    static async findAll() {
        try {
            let sql = `
                SELECT
                    ticket.ticketID AS ticketId,
                    ticket.bookingID AS bookingId,
                    passenger.fullname AS passengerName,
                    user.UserName AS userName,
                    coach_type.type AS coachType,
                    train.trainName,
                    ticket.seatNumber,
                    departure.stationName AS departureStation,
                    arrival.stationName AS arrivalStation,
                    ticket.departureTime,
                    ticket.departureDate,
                    ticket.ticketPrice
                FROM ticket
                LEFT JOIN booking
                    ON ticket.bookingID = booking.bookingID
                LEFT JOIN passenger
                    ON booking.passengerID = passenger.passengerID
                LEFT JOIN user
                    ON booking.userID = user.userID
                LEFT JOIN coach
                    ON ticket.coachID = coach.coachID
                LEFT JOIN coach_type
                    ON coach.coach_typeID = coach_type.coach_typeID
                LEFT JOIN train
                    ON ticket.trainID = train.trainID
                LEFT JOIN station AS departure
                    ON ticket.departure_stationID = departure.stationID
                LEFT JOIN station AS arrival
                    ON ticket.arrival_stationID = arrival.stationID                
            `
            const [results] = await pool.query(sql);
            return results;
        } catch (error) {
            throw error;
        }
    }

    static async deleteById(id) {
        try {
            const [result] = await pool.query(
                'DELETE FROM ticket WHERE ticketID = ?',
                [id]
            );
            return result.affectedRows;
        } catch (error) {
            throw error;
        }
    }

    static async create(ticketData) {
        const { bookingId, passengerId, coachId, trainId, seatNumber, departureId, arrivalId, departureTime, departureDate, ticketPrice, expireDateTime } = ticketData;
        try {
            const [result] = await pool.query(
                `INSERT INTO ticket (bookingID, passengerID, coachID, trainID, seatNumber, departure_stationID, arrival_stationID, departureTime, departureDate, ticketPrice, expire_date_time)
                VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
                [bookingId, passengerId, coachId, trainId, seatNumber, departureId, arrivalId, departureTime, departureDate, ticketPrice, expireDateTime]
            );
            return result;
        } catch (error) {
            throw error;
        }
    }

    static async findByFilter(ticketFilters) {
        // const {ticketId, trainType, departureName, arrivalName, departureDate} = ticketFilters;
        const { userId, passengerName, passengerEmail, phoneNumber } = ticketFilters;
        try {
            let sql = `
                SELECT
                    ticket.ticketID AS ticketId,
                    ticket.bookingID AS bookingId,
                    ticket.expire_date_time AS expireDateTime,
                    booking.bookingDate AS bookingDateTime,
                    booking.status AS status,
                    passenger.fullname AS passengerName,
                    user.UserName AS userName,
                    coach_type.type AS coachType,
                    train.trainName,
                    ticket.seatNumber,
                    departure.stationName AS departureStation,
                    arrival.stationName AS arrivalStation,
                    ticket.departureTime,
                    ticket.departureDate,
                    ticket.ticketPrice,
                    user.UserName AS userName,
                    user.Email AS userEmail,
                    passenger.Email as passengerEmail
                FROM ticket
                LEFT JOIN booking
                    ON ticket.bookingID = booking.bookingID
                LEFT JOIN passenger
                    ON booking.passengerID = passenger.passengerID
                LEFT JOIN user
                    ON booking.userID = user.userID
                LEFT JOIN coach
                    ON ticket.coachID = coach.coachID
                LEFT JOIN coach_type
                    ON coach.coach_typeID = coach_type.coach_typeID
                LEFT JOIN train
                    ON ticket.trainID = train.trainID
                LEFT JOIN station AS departure
                    ON ticket.departure_stationID = departure.stationID
                LEFT JOIN station AS arrival
                    ON ticket.arrival_stationID = arrival.stationID
                WHERE 1=1                 
            `
            let params = [];
            if (userId) {
                sql += " AND user.userID = ?";
                params.push(userId);
            }
            if (passengerName) {
                sql += " AND REPLACE(LOWER(passenger.fullname), ' ', '') LIKE ?";
                params.push(`%${passengerName.toLowerCase().replace(/\s/g, '')}%`);
            }
            if (passengerEmail) {
                sql += " AND passenger.email = ?";
                params.push(passengerEmail);
            }
            if (phoneNumber) {
                sql += " AND passenger.phone_number = ?";
                params.push(phoneNumber);
            }
            // if(departureName){
            //     sql+=" AND departure.stationName = ?";
            //     params.push(departureName);
            // }
            // if(arrivalName){
            //     sql+=" AND arrival.stationName = ?";
            //     params.push(arrivalName);
            // }
            // if(departureDate){
            //     sql+=" AND ticket.departureDate = ?";
            //     params.push(departureDate);
            // }
            const [results] = await pool.query(sql, params);
            return results;
        } catch (error) {
            throw error;
        }
    }

    static async findByBookingId(bookingId) {
        try {
            const sql = `
                SELECT
                    ticket.ticketID,
                    ticket.bookingID,
                    ticket.seatNumber,
                    ticket.departureTime,
                    ticket.departureDate,
                    ticket.ticketPrice,
                    train.trainName,
                    departure.stationName AS departureStation,
                    arrival.stationName AS arrivalStation,
                    coach_type.type AS coachType
                FROM ticket
                LEFT JOIN train ON ticket.trainID = train.trainID
                LEFT JOIN station AS departure ON ticket.departure_stationID = departure.stationID
                LEFT JOIN station AS arrival ON ticket.arrival_stationID = arrival.stationID
                LEFT JOIN coach ON ticket.coachID = coach.coachID
                LEFT JOIN coach_type ON coach.coach_typeID = coach_type.coach_typeID
                WHERE ticket.bookingID = ?
            `;
            const [results] = await pool.query(sql, [bookingId]);
            return results;
        } catch (error) {
            throw error;
        }
    }
}

export default Tickets;