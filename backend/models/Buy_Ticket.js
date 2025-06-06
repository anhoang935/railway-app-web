import pool from '../Config/db.js';

class Buy_Ticket{
    static async findTrain(departureStation, arrivalStation, arrivalTime = null){
        try {
            const query = `
                SELECT t.trainName AS 'Train Name', 
                (SUM(ct.capacity) - COUNT(tk.ticketID)) AS 'Available Capacity', 
                j_departure.departureTime AS 'Departure Time', 
                j_arrival.arrivalTime AS 'Arrival Time' 
                FROM train t 
                JOIN schedule sch ON t.trainID = sch.trainID 
                JOIN journey j_departure ON sch.scheduleID = j_departure.scheduleID 
                JOIN journey j_arrival ON sch.scheduleID = j_arrival.scheduleID 
                JOIN station s_departure ON j_departure.stationID = s_departure.stationID 
                JOIN station s_arrival ON j_arrival.stationID = s_arrival.stationID 
                JOIN coach c ON t.trainID = c.trainID 
                JOIN coach_type ct ON c.coach_typeID = ct.coach_typeID 
                LEFT JOIN ticket tk ON c.coachID = tk.coachID AND 
                tk.departure_stationID = s_departure.stationID AND 
                tk.arrival_stationID = s_arrival.stationID 
                WHERE s_departure.stationName = ? AND 
                s_arrival.stationName = ? AND 
                j_departure.journeyID < j_arrival.journeyID AND
                (? IS NULL OR j_departure.departureTime >= ?)
                GROUP BY t.trainName, 
                j_departure.departureTime, 
                j_arrival.arrivalTime
                ORDER BY j_departure.departureTime ASC
            `;

            const [results] = await pool.execute(query, [
                departureStation, 
                arrivalStation, 
                arrivalTime, 
                arrivalTime
            ]);
            
            return results;
        } catch (error) {
            throw new Error(`Error finding trains: ${error.message}`);
        }
    }

    static async getCoachesByTrainName(trainName) {
        try {
            const query = `
                SELECT c.coachID, t.trainName, c.coach_typeID 
                FROM coach c
                JOIN train t ON c.trainID = t.trainID
                WHERE t.trainName = ?
            `;
            const [results] = await pool.execute(query, [trainName]);
            return results;
        } catch (error) {
            throw new Error(`Error fetching coaches: ${error.message}`);
        }
    }

    static async getSeatBooked(trainName, coachID){
        try {
            const query = `
                select seatNumber 
                from defaultdb.ticket
                join train on ticket.trainID = train.trainID
                where trainName = ? and coachID = ?
            `
            const [results] = await pool.execute(query, [trainName, coachID]);
            return results;
        } catch (error) {
            throw new Error(`Error fetching booked seats: ${error.message}`);
        }
    }
}

export default Buy_Ticket;