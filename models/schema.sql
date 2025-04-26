CREATE DATABASE IF NOT EXISTS booking_db;
USE booking_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE
);

CREATE TABLE room_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50),
  password VARCHAR(255)
);

CREATE TABLE rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  capacity INT,
  type_id INT,
  FOREIGN KEY (type_id) REFERENCES room_types(id)
);

CREATE TABLE schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slot_time TIME
);

CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  room_id INT,
  schedule_id INT,
  booking_date DATE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (schedule_id) REFERENCES schedules(id)
);