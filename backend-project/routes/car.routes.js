const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');

// Get all cars
router.get('/', auth.verifyToken, async (req, res) => {
  try {
    const [cars] = await db.query('SELECT * FROM Car ORDER BY PlateNumber');
    res.status(200).json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single car by plate number
router.get('/:plateNumber', auth.verifyToken, async (req, res) => {
  try {
    const [car] = await db.query('SELECT * FROM Car WHERE PlateNumber = ?', [req.params.plateNumber]);
    
    if (car.length === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    res.status(200).json(car[0]);
  } catch (error) {
    console.error('Error fetching car:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new car
router.post('/', auth.verifyToken, async (req, res) => {
  try {
    const { PlateNumber, DriverName, CarType, PhoneNumber } = req.body;
    
    // Validate required fields
    if (!PlateNumber || !DriverName || !CarType || !PhoneNumber) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Check if car already exists
    const [existingCar] = await db.query('SELECT * FROM Car WHERE PlateNumber = ?', [PlateNumber]);
    if (existingCar.length > 0) {
      return res.status(400).json({ message: 'A car with this plate number already exists' });
    }
    
    // Insert new car
    await db.query(
      'INSERT INTO Car (PlateNumber, DriverName, CarType, PhoneNumber) VALUES (?, ?, ?, ?)',
      [PlateNumber, DriverName, CarType, PhoneNumber]
    );
    
    res.status(201).json({ message: 'Car created successfully' });
  } catch (error) {
    console.error('Error creating car:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a car
router.put('/:plateNumber', auth.verifyToken, async (req, res) => {
  try {
    const { DriverName, CarType, PhoneNumber } = req.body;
    const plateNumber = req.params.plateNumber;
    
    // Validate required fields
    if (!DriverName || !CarType || !PhoneNumber) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Check if car exists
    const [existingCar] = await db.query('SELECT * FROM Car WHERE PlateNumber = ?', [plateNumber]);
    if (existingCar.length === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    // Update car
    await db.query(
      'UPDATE Car SET DriverName = ?, CarType = ?, PhoneNumber = ? WHERE PlateNumber = ?',
      [DriverName, CarType, PhoneNumber, plateNumber]
    );
    
    res.status(200).json({ message: 'Car updated successfully' });
  } catch (error) {
    console.error('Error updating car:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a car
router.delete('/:plateNumber', auth.verifyToken, async (req, res) => {
  try {
    const plateNumber = req.params.plateNumber;
    
    // Check if car exists
    const [existingCar] = await db.query('SELECT * FROM Car WHERE PlateNumber = ?', [plateNumber]);
    if (existingCar.length === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    // Check if car has any related records in ParkingRecords
    const [relatedParkingRecords] = await db.query(
      'SELECT * FROM ParkingRecord WHERE PlateNumber = ?',
      [plateNumber]
    );
    
    if (relatedParkingRecords.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete car with existing parking records. Delete related records first.' 
      });
    }
    
    // Delete car
    await db.query('DELETE FROM Car WHERE PlateNumber = ?', [plateNumber]);
    
    res.status(200).json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Error deleting car:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 