// const express = require('express');
// const mysql = require('mysql2');
// const cors = require('cors');
import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
// require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

import trainRoutes from './routes/train.js';

app.use('/api/v1/trains', trainRoutes);

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect(err => {
    if(err) {
        console.error('Could not connect to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

app.get('/api/tickets', async (req, res, next) => {
    const {userId} = req.query;
    if(!userId) return next();

    const sql = `
        SELECT
            ticket.ticketID AS ticketId, 
            passenger.fullname AS passengerName,
            train.trainName,
            departure_station.stationName AS departureStation,
            arrival_station.stationName AS arrivalStation,
            ticket.departureDate,
            ticket.departureTime,
            ticket.seatNumber,
            coach_type.type AS coachType
        FROM ticket
        LEFT JOIN train 
            ON ticket.trainID = train.trainID
        LEFT JOIN station AS departure_station
            ON ticket.departure_stationID = departure_station.stationID
        LEFT JOIN station AS arrival_station
            ON ticket.arrival_stationID = arrival_station.stationID
        LEFT JOIN passenger
            ON ticket.passengerID = passenger.passengerID
        LEFT JOIN coach
            ON ticket.coachID = coach.coachID 
        LEFT JOIN coach_type
            ON coach.coach_typeID = coach_type.coach_typeID
        LEFT JOIN booking
            ON booking.passengerID = passenger.passengerID
        LEFT JOIN user
            ON booking.userID = user.userID
        WHERE user.userID = ?
    `;

    try {
        const [results] = await db.promise().query(sql, [userId]);
        return res.status(200).json(results);          
    } catch (error) {
        console.error('Error fetching tickets by user ID:', error);
        return res.status(500).json({error: 'Internal server error'});
    }
});

app.get('/api/tickets', async (req, res) => {
    const {ticketId, trainType, departureStationName, arrivalStationName, departureDate} = req.query
    
    let sql = `
        SELECT
            ticket.ticketID AS ticketId, 
            passenger.fullname AS passengerName,
            train.trainName,
            departure_station.stationName AS departureStation,
            arrival_station.stationName AS arrivalStation,
            ticket.departureDate,
            ticket.departureTime,
            ticket.seatNumber,
            coach_type.type AS coachType
        FROM ticket
        LEFT JOIN train 
            ON ticket.trainID = train.trainID
        LEFT JOIN station AS departure_station
            ON ticket.departure_stationID = departure_station.stationID
        LEFT JOIN station AS arrival_station
            ON ticket.arrival_stationID = arrival_station.stationID
        LEFT JOIN passenger
            ON ticket.passengerID = passenger.passengerID
        LEFT JOIN coach
            ON ticket.coachID = coach.coachID 
        LEFT JOIN coach_type
            ON coach.coach_typeID = coach_type.coach_typeID 
        WHERE 1=1
    `;
    let params = [];
    if(ticketId){
        sql += ' AND ticket.ticketID = ?';
        params.push(ticketId);
    }
    if(trainType){
        sql += ' AND train.trainType = ?';   
        params.push(trainType); 
    }
    if(departureStationName){
        sql += ' AND departure_station.stationName = ?';
        params.push(departureStationName);
    }
    if(arrivalStationName){
        sql += ' AND arrival_station.stationName = ?';
        params.push(arrivalStationName);
    }
    if(departureDate){
        sql += ' AND ticket.departureDate = ?';
        params.push(departureDate);
    }

    try {
        const [results] = await db.promise().query(sql, params);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({error: 'Internal server error'});
    }

}) 
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log('Server running on http://localhost:${port}');
});
