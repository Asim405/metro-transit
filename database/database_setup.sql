-- Metro Transit Management System - Database Schema
-- Database: metro_transit_db
-- Designed in 3rd Normal Form (3NF)

-- Create Database
CREATE DATABASE IF NOT EXISTS metro_transit_db;
USE metro_transit_db;

-- Drop existing tables and views (for fresh setup)
DROP VIEW IF EXISTS Active_Schedule_View;
DROP TABLE IF EXISTS Bookings;
DROP TABLE IF EXISTS Schedules;
DROP TABLE IF EXISTS Routes;
DROP TABLE IF EXISTS Stations;
DROP TABLE IF EXISTS Users;

-- ============================================================
-- TABLE: Users
-- Description: Stores user information for passengers
-- ============================================================
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: Stations
-- Description: Stores metro/bus station information
-- Normalization: Each station is atomic
-- ============================================================
CREATE TABLE Stations (
    station_id INT AUTO_INCREMENT PRIMARY KEY,
    station_name VARCHAR(100) NOT NULL UNIQUE,
    city VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    facilities TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: Routes
-- Description: Stores route information (One-to-Many with Schedules)
-- Normalization: 3NF - Routes depends only on route_id
-- Relationships: One Route -> Many Schedules
-- ============================================================
CREATE TABLE Routes (
    route_id INT AUTO_INCREMENT PRIMARY KEY,
    route_name VARCHAR(100) NOT NULL,
    origin_station_id INT NOT NULL,
    destination_station_id INT NOT NULL,
    distance_km DECIMAL(8, 2),
    estimated_duration_minutes INT,
    vehicle_type ENUM('Bus', 'Train', 'Metro') NOT NULL,
    operator_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (origin_station_id) REFERENCES Stations(station_id) ON DELETE RESTRICT,
    FOREIGN KEY (destination_station_id) REFERENCES Stations(station_id) ON DELETE RESTRICT,
    CHECK (origin_station_id != destination_station_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: Schedules
-- Description: Stores schedule information for each route instance
-- Normalization: 3NF - Schedules depends on route_id and departure time
-- Relationships: Many Schedules belong to One Route
--                One Schedule has Many Bookings
-- ============================================================
CREATE TABLE Schedules (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT NOT NULL,
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    total_seats INT NOT NULL DEFAULT 50,
    available_seats INT NOT NULL,
    fare_amount DECIMAL(8, 2) NOT NULL,
    status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES Routes(route_id) ON DELETE CASCADE,
    CHECK (available_seats >= 0 AND available_seats <= total_seats),
    CHECK (departure_time < arrival_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: Bookings
-- Description: Junction table for Many-to-Many relationship between Users and Schedules
-- Normalization: 3NF - Bookings stores only foreign keys and atomic booking data
-- Relationships: Many Users can book Many Schedules (via Bookings)
-- ============================================================
CREATE TABLE Bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    schedule_id INT NOT NULL,
    num_seats INT NOT NULL DEFAULT 1,
    total_price DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('Pending', 'Confirmed', 'Failed', 'Refunded') DEFAULT 'Pending',
    booking_status ENUM('Active', 'Completed', 'Cancelled') DEFAULT 'Active',
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES Schedules(schedule_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_schedule (user_id, schedule_id),
    CHECK (num_seats > 0),
    CHECK (total_price > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- INDEXES for Performance Optimization
-- ============================================================
CREATE INDEX idx_schedules_route ON Schedules(route_id);
CREATE INDEX idx_schedules_departure ON Schedules(departure_time);
CREATE INDEX idx_schedules_status ON Schedules(status);
CREATE INDEX idx_bookings_user ON Bookings(user_id);
CREATE INDEX idx_bookings_schedule ON Bookings(schedule_id);
CREATE INDEX idx_bookings_payment_status ON Bookings(payment_status);
CREATE INDEX idx_routes_origin ON Routes(origin_station_id);
CREATE INDEX idx_routes_destination ON Routes(destination_station_id);

-- ============================================================
-- TRIGGER: Decrement Available Seats on New Booking
-- Description: Automatically decrements available_seats in Schedules table
--              when a new booking is added to maintain data consistency
-- Timing: BEFORE INSERT
-- ============================================================
DELIMITER //
CREATE TRIGGER trg_decrement_seats_on_booking
BEFORE INSERT ON Bookings
FOR EACH ROW
BEGIN
    DECLARE v_available_seats INT;
    DECLARE v_error_message VARCHAR(255);
    
    -- Get current available seats for the schedule
    SELECT available_seats INTO v_available_seats
    FROM Schedules
    WHERE schedule_id = NEW.schedule_id
    FOR UPDATE;  -- Lock the row for transaction safety
    
    -- Check if enough seats are available
    IF v_available_seats < NEW.num_seats THEN
        SET v_error_message = CONCAT('Not enough seats available. Available: ', v_available_seats, ', Requested: ', NEW.num_seats);
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_error_message;
    END IF;
    
    -- Decrement available seats
    UPDATE Schedules
    SET available_seats = available_seats - NEW.num_seats
    WHERE schedule_id = NEW.schedule_id;
END //
DELIMITER ;

-- ============================================================
-- DATABASE VIEW: Active_Schedule_View
-- Description: Joins Routes and Schedules to show active schedules
--              with origin and destination station names
-- Purpose: Optimized query for frontend to fetch active schedules
-- ============================================================
CREATE VIEW Active_Schedule_View AS
SELECT 
    s.schedule_id,
    s.route_id,
    r.route_name,
    r.vehicle_type,
    r.operator_name,
    r.estimated_duration_minutes,
    r.distance_km,
    s.departure_time,
    s.arrival_time,
    s.total_seats,
    s.available_seats,
    s.fare_amount,
    s.status,
    origin.station_name AS origin_station,
    destination.station_name AS destination_station,
    origin.city AS origin_city,
    destination.city AS destination_city,
    s.created_at
FROM Schedules s
INNER JOIN Routes r ON s.route_id = r.route_id
INNER JOIN Stations origin ON r.origin_station_id = origin.station_id
INNER JOIN Stations destination ON r.destination_station_id = destination.station_id
WHERE s.status IN ('Scheduled', 'In Progress')
    AND s.departure_time > NOW()
ORDER BY s.departure_time ASC;

-- ============================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================

-- Insert Sample Users
INSERT INTO Users (name, email, phone, password_hash) VALUES
('John Doe', 'john@example.com', '9876543210', '$2b$10$hashedpassword1'),
('Jane Smith', 'jane@example.com', '9876543211', '$2b$10$hashedpassword2'),
('Robert Johnson', 'robert@example.com', '9876543212', '$2b$10$hashedpassword3');

-- Insert Sample Stations
INSERT INTO Stations (station_name, city, latitude, longitude, facilities) VALUES
('Central Station', 'New York', 40.7128, -74.0060, 'WiFi, Restroom, Food Court'),
('Grand Central', 'New York', 40.7527, -73.9772, 'WiFi, Restroom, Ticket Counter'),
('Penn Station', 'New York', 34.3406, -118.2427, 'WiFi, Parking'),
('Union Square', 'San Francisco', 37.7879, -122.4073, 'WiFi, Restroom'),
('Ferry Terminal', 'San Francisco', 37.7749, -122.3851, 'Restroom, Food Court');

-- Insert Sample Routes
INSERT INTO Routes (route_name, origin_station_id, destination_station_id, distance_km, estimated_duration_minutes, vehicle_type, operator_name) VALUES
('NY Express Line', 1, 2, 15.5, 45, 'Bus', 'Metro Transit Co'),
('City Metro Line 1', 2, 3, 25.0, 60, 'Metro', 'Transit Authority'),
('Bay Area Express', 4, 5, 12.8, 35, 'Bus', 'Bay Transit'),
('Cross City Line', 1, 3, 40.2, 90, 'Train', 'National Railways');

-- Insert Sample Schedules
INSERT INTO Schedules (route_id, departure_time, arrival_time, total_seats, available_seats, fare_amount, status) VALUES
(1, DATE_ADD(NOW(), INTERVAL 2 HOUR), DATE_ADD(NOW(), INTERVAL 3 HOUR), 50, 50, 15.00, 'Scheduled'),
(1, DATE_ADD(NOW(), INTERVAL 5 HOUR), DATE_ADD(NOW(), INTERVAL 6 HOUR), 50, 50, 15.00, 'Scheduled'),
(2, DATE_ADD(NOW(), INTERVAL 3 HOUR), DATE_ADD(NOW(), INTERVAL 4 HOUR), 75, 75, 22.50, 'Scheduled'),
(3, DATE_ADD(NOW(), INTERVAL 4 HOUR), DATE_ADD(NOW(), INTERVAL 5 HOUR), 50, 50, 12.00, 'Scheduled'),
(4, DATE_ADD(NOW(), INTERVAL 6 HOUR), DATE_ADD(NOW(), INTERVAL 8 HOUR), 100, 100, 35.00, 'Scheduled');

-- ============================================================
-- END OF DATABASE SETUP SCRIPT
-- ============================================================
