import pool from '../Config/db.js';

class Tickets {

    static async findAll(){
        try{
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

    static async deleteById(id){
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
        const {bookingId, passengerId, coachId, trainId, seatNumber, departureId, arrivalId, departureTime, departureDate, ticketPrice} = ticketData;
        try {
            const [result] = await pool.query(
                `INSERT INTO ticket (bookingID, passengerID, coachID, trainID, seatNumber, departure_stationID, arrival_stationID, departureTime, departureDate, ticketPrice)
                VALUES(?,?,?,?,?,?,?,?,?,?)`,
                [bookingId, passengerId, coachId, trainId, seatNumber, departureId, arrivalId, departureTime, departureDate, ticketPrice]
            );
            return result;
        } catch (error) {
            throw error;
        }    
    }

    static async findByFilter(ticketFilters){
        const {ticketId, trainType, departureName, arrivalName, departureDate} = ticketFilters;
        try{
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
                WHERE 1=1                 
            `
            let params = [];
            if(ticketId){
                sql+=" AND ticket.ticketId = ?";
                params.push(ticketId);
            }
            if(trainType){
                sql+=" AND train.trainType = ?";
                params.push(trainType);
            }
            if(departureName){
                sql+=" AND departure.stationName = ?";
                params.push(departureName);
            }
            if(arrivalName){
                sql+=" AND arrival.stationName = ?";
                params.push(arrivalName);
            }
            if(departureDate){
                sql+=" AND ticket.departureDate = ?";
                params.push(departureDate);
            }
            const [results] = await pool.query(sql,params);
            return results;
        } catch (error) {
            throw error;
        }
    }

}

export default Tickets;