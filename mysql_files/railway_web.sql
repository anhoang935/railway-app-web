-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Database: railway_web
-- ------------------------------------------------------
-- Server version	8.0.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '7d6441b3-4032-11f0-94ab-862ccfb04507:1-396';

--
-- Table structure for table `booking`
--

DROP TABLE IF EXISTS `booking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking` (
  `bookingID` int NOT NULL AUTO_INCREMENT,
  `passengerID` int NOT NULL,
  `bookingDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `totalPrice` int DEFAULT NULL,
  `status` enum('pending','paid','cancelled','expired') NOT NULL DEFAULT 'pending',
  `userID` int DEFAULT NULL,
  PRIMARY KEY (`bookingID`),
  KEY `passengerID` (`passengerID`),
  KEY `user_ibfk_1` (`userID`),
  CONSTRAINT `booking_ibfk_1` FOREIGN KEY (`passengerID`) REFERENCES `passenger` (`passengerID`),
  CONSTRAINT `user_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `user` (`userID`)
) ENGINE=InnoDB AUTO_INCREMENT=122 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `coach`
--

DROP TABLE IF EXISTS `coach`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coach` (
  `coachID` int NOT NULL AUTO_INCREMENT,
  `trainID` int NOT NULL,
  `coach_typeID` varchar(45) NOT NULL,
  PRIMARY KEY (`coachID`),
  KEY `fk_coach_coach_type` (`coach_typeID`),
  KEY `trainID_idx` (`trainID`),
  CONSTRAINT `fk_coach_coach_type` FOREIGN KEY (`coach_typeID`) REFERENCES `coach_type` (`coach_typeID`),
  CONSTRAINT `trainID` FOREIGN KEY (`trainID`) REFERENCES `train` (`trainID`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `coach_type`
--

DROP TABLE IF EXISTS `coach_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coach_type` (
  `coach_typeID` varchar(45) NOT NULL,
  `type` varchar(45) NOT NULL,
  `price` int DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  PRIMARY KEY (`coach_typeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `journey`
--

DROP TABLE IF EXISTS `journey`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `journey` (
  `journeyID` varchar(45) NOT NULL,
  `scheduleID` int NOT NULL,
  `stationID` int NOT NULL,
  `arrivalTime` time NOT NULL,
  `departureTime` time NOT NULL,
  PRIMARY KEY (`journeyID`),
  KEY `scheduleID` (`scheduleID`),
  KEY `stationID` (`stationID`),
  CONSTRAINT `scheduleID` FOREIGN KEY (`scheduleID`) REFERENCES `schedule` (`scheduleID`),
  CONSTRAINT `stationID` FOREIGN KEY (`stationID`) REFERENCES `station` (`stationID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `passenger`
--

DROP TABLE IF EXISTS `passenger`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `passenger` (
  `passengerID` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(45) NOT NULL,
  `phone_number` varchar(45) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `status` varchar(45) NOT NULL,
  PRIMARY KEY (`passengerID`),
  UNIQUE KEY `passengerID_UNIQUE` (`passengerID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `schedule`
--

DROP TABLE IF EXISTS `schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedule` (
  `scheduleID` int NOT NULL AUTO_INCREMENT,
  `trainID` int NOT NULL,
  `start_stationID` int NOT NULL,
  `end_stationID` int NOT NULL,
  `departureTime` time NOT NULL,
  `arrivalTime` time NOT NULL,
  `scheduleStatus` varchar(45) NOT NULL,
  PRIMARY KEY (`scheduleID`),
  KEY `staionID_id_idx` (`start_stationID`,`end_stationID`),
  KEY `stationID_idx1` (`end_stationID`),
  KEY `trainID_idx` (`trainID`),
  CONSTRAINT `stationId_fk1` FOREIGN KEY (`start_stationID`) REFERENCES `station` (`stationID`),
  CONSTRAINT `stationId_fk2` FOREIGN KEY (`end_stationID`) REFERENCES `station` (`stationID`),
  CONSTRAINT `trainId_fk2` FOREIGN KEY (`trainID`) REFERENCES `train` (`trainID`),
  CONSTRAINT `chk_different_stations` CHECK ((`start_stationID` <> `end_stationID`))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `station`
--

DROP TABLE IF EXISTS `station`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `station` (
  `stationID` int NOT NULL AUTO_INCREMENT,
  `stationName` varchar(45) NOT NULL,
  PRIMARY KEY (`stationID`),
  KEY `idx_stationID` (`stationID`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ticket`
--

DROP TABLE IF EXISTS `ticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket` (
  `ticketID` int NOT NULL AUTO_INCREMENT,
  `bookingID` int NOT NULL,
  `passengerID` int NOT NULL,
  `trainID` int NOT NULL,
  `seatNumber` varchar(10) NOT NULL,
  `departure_stationID` int NOT NULL,
  `arrival_stationID` int NOT NULL,
  `departureTime` time NOT NULL,
  `departureDate` date NOT NULL,
  `ticketPrice` int NOT NULL,
  `coachID` int NOT NULL,
  `expire_date_time` datetime DEFAULT NULL,
  PRIMARY KEY (`ticketID`),
  KEY `passengerID` (`passengerID`),
  KEY `bookingID_idx` (`bookingID`),
  KEY `train_ibfk_1_idx` (`trainID`),
  KEY `stationId_fk3` (`departure_stationID`),
  KEY `stationId_fk4` (`arrival_stationID`),
  KEY `coach_ibfk_1_idx` (`coachID`),
  CONSTRAINT `bookingID` FOREIGN KEY (`bookingID`) REFERENCES `booking` (`bookingID`),
  CONSTRAINT `coach_ibfk_1` FOREIGN KEY (`coachID`) REFERENCES `coach` (`coachID`),
  CONSTRAINT `stationId_fk3` FOREIGN KEY (`departure_stationID`) REFERENCES `station` (`stationID`),
  CONSTRAINT `stationId_fk4` FOREIGN KEY (`arrival_stationID`) REFERENCES `station` (`stationID`),
  CONSTRAINT `ticket_ibfk_2` FOREIGN KEY (`passengerID`) REFERENCES `passenger` (`passengerID`),
  CONSTRAINT `train_ibfk_1` FOREIGN KEY (`trainID`) REFERENCES `train` (`trainID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `track`
--

DROP TABLE IF EXISTS `track`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `track` (
  `trackID` int NOT NULL AUTO_INCREMENT,
  `station1ID` int NOT NULL,
  `station2ID` int NOT NULL,
  `distance` int NOT NULL,
  PRIMARY KEY (`trackID`),
  KEY `station1ID` (`station1ID`),
  KEY `station2ID` (`station2ID`),
  CONSTRAINT `track_ibfk_1` FOREIGN KEY (`station1ID`) REFERENCES `station` (`stationID`),
  CONSTRAINT `track_ibfk_2` FOREIGN KEY (`station2ID`) REFERENCES `station` (`stationID`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `train`
--

DROP TABLE IF EXISTS `train`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `train` (
  `trainID` int NOT NULL AUTO_INCREMENT,
  `trainName` varchar(45) NOT NULL,
  `coachTotal` int NOT NULL,
  `trainType` varchar(45) NOT NULL,
  PRIMARY KEY (`trainID`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `userID` int NOT NULL AUTO_INCREMENT,
  `UserName` varchar(255) DEFAULT NULL,
  `Email` varchar(255) DEFAULT NULL,
  `Gender` varchar(10) DEFAULT NULL,
  `PhoneNumber` varchar(15) DEFAULT NULL,
  `DateOfBirth` date DEFAULT NULL,
  `Address` text,
  `Password` varchar(255) DEFAULT NULL,
  `VerifyCode` varchar(255) DEFAULT NULL,
  `OTP` varchar(6) DEFAULT NULL,
  `OTPExpiry` datetime DEFAULT NULL,
  `Status` varchar(255) DEFAULT '',
  `Role` varchar(50) NOT NULL DEFAULT 'Customer',
  PRIMARY KEY (`userID`),
  UNIQUE KEY `UserName_UNIQUE` (`UserName`),
  UNIQUE KEY `Email_UNIQUE` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-05 16:41:59
