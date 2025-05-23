-- Create database
CREATE DATABASE IF NOT EXISTS PSSMS;
USE PSSMS;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Role ENUM('admin', 'staff') NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Car Washing Sales Management (CWSMS) tables
CREATE TABLE IF NOT EXISTS Car (
    PlateNumber VARCHAR(20) PRIMARY KEY,
    CarType VARCHAR(50) NOT NULL,
    CarSize VARCHAR(20) NOT NULL,
    DriverName VARCHAR(100) NOT NULL,
    PhoneNumber VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS Package (
    PackageNumber INT AUTO_INCREMENT PRIMARY KEY,
    PackageName VARCHAR(100) NOT NULL,
    PackageDescription TEXT,
    PackagePrice DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS ServicePackage (
    RecordNumber INT AUTO_INCREMENT PRIMARY KEY,
    ServiceDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    PlateNumber VARCHAR(20) NOT NULL,
    PackageNumber INT NOT NULL,
    FOREIGN KEY (PlateNumber) REFERENCES Car(PlateNumber) ON DELETE CASCADE,
    FOREIGN KEY (PackageNumber) REFERENCES Package(PackageNumber) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS CWPayment (
    PaymentNumber INT AUTO_INCREMENT PRIMARY KEY,
    AmountPaid DECIMAL(10, 2) NOT NULL,
    PaymentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    RecordNumber INT NOT NULL,
    FOREIGN KEY (RecordNumber) REFERENCES ServicePackage(RecordNumber) ON DELETE CASCADE
);

-- Parking Sales Management (PSSMS) tables
CREATE TABLE IF NOT EXISTS ParkingSlot (
    SlotNumber INT AUTO_INCREMENT PRIMARY KEY,
    SlotStatus ENUM('available', 'occupied') NOT NULL DEFAULT 'available'
);

-- Note: Car table is already defined above and shared with CWSMS

CREATE TABLE IF NOT EXISTS ParkingRecord (
    ParkingID INT AUTO_INCREMENT PRIMARY KEY,
    EntryTime DATETIME NOT NULL,
    ExitTime DATETIME NULL,
    Duration INT NULL,
    PlateNumber VARCHAR(20) NOT NULL,
    SlotNumber INT NOT NULL,
    FOREIGN KEY (PlateNumber) REFERENCES Car(PlateNumber) ON DELETE CASCADE,
    FOREIGN KEY (SlotNumber) REFERENCES ParkingSlot(SlotNumber) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS PSPayment (
    PaymentNumber INT AUTO_INCREMENT PRIMARY KEY,
    AmountPaid DECIMAL(10, 2) NOT NULL,
    PaymentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    PlateNumber VARCHAR(20) NOT NULL,
    FOREIGN KEY (PlateNumber) REFERENCES Car(PlateNumber) ON DELETE CASCADE
);

-- Insert default admin user (password: admin123)
INSERT INTO Users (Username, Password, Role) VALUES
('admin', '$2b$10$7JHAUuSQKT3G3.PaICkSu.dVRImxWGCLNsrYGOLDiYRN4QJYkMMt2', 'admin');

-- Insert some default packages
INSERT INTO Package (PackageName, PackageDescription, PackagePrice) VALUES
('Basic Wash', 'Exterior wash and basic interior cleaning', 15.00),
('Premium Wash', 'Exterior wash, interior detailing, and wax', 25.00),
('Deluxe Package', 'Full detailing inside and out, premium wax', 40.00);

-- Insert some default parking slots
INSERT INTO ParkingSlot (SlotStatus) VALUES
('available'),
('available'),
('available'),
('available'),
('available'),
('available'),
('available'),
('available'),
('available'),
('available'); 