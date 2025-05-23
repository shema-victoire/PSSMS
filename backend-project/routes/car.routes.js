const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

// Get all cars
router.get('/', verifyToken, async (req, res) => {
  try {
    const [cars] = await db.query('SELECT * FROM Car');
    res.status(200).json(cars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get car by plate number
router.get('/:plateNumber', verifyToken, async (req, res) => {
  try {
    const [cars] = await db.query('SELECT * FROM Car WHERE PlateNumber = ?', [req.params.plateNumber]);
    
    if (cars.length === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    res.status(200).json(cars[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add new car
router.post('/', verifyToken, async (req, res) => {
  try {
    const { PlateNumber, CarType, CarSize, DriverName, PhoneNumber } = req.body;
    
    // Check if car already exists
    const [existingCars] = await db.query('SELECT * FROM Car WHERE PlateNumber = ?', [PlateNumber]);
    
    if (existingCars.length > 0) {
      return res.status(400).json({ message: 'Car with this plate number already exists' });
    }
    
    // Add car to database
    await db.query(
      'INSERT INTO Car (PlateNumber, CarType, CarSize, DriverName, PhoneNumber) VALUES (?, ?, ?, ?, ?)',
      [PlateNumber, CarType, CarSize, DriverName, PhoneNumber]
    );
    
    res.status(201).json({ message: 'Car added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update car
router.put('/:plateNumber', verifyToken, async (req, res) => {
  try {
    const { CarType, CarSize, DriverName, PhoneNumber } = req.body;
    const plateNumber = req.params.plateNumber;
    
    // Check if car exists
    const [existingCars] = await db.query('SELECT * FROM Car WHERE PlateNumber = ?', [plateNumber]);
    
    if (existingCars.length === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    // Update car in database
    await db.query(
      'UPDATE Car SET CarType = ?, CarSize = ?, DriverName = ?, PhoneNumber = ? WHERE PlateNumber = ?',
      [CarType, CarSize, DriverName, PhoneNumber, plateNumber]
    );
    
    res.status(200).json({ message: 'Car updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete car
router.delete('/:plateNumber', verifyToken, async (req, res) => {
  try {
    const plateNumber = req.params.plateNumber;
    
    // Check if car exists
    const [existingCars] = await db.query('SELECT * FROM Car WHERE PlateNumber = ?', [plateNumber]);
    
    if (existingCars.length === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    // Delete car from database
    await db.query('DELETE FROM Car WHERE PlateNumber = ?', [plateNumber]);
    
    res.status(200).json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 