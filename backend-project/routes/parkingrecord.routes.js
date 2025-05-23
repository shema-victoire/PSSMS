const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

// Get all parking records
router.get('/', verifyToken, async (req, res) => {
  try {
    const [records] = await db.query(`
      SELECT pr.*, c.DriverName, c.PhoneNumber, c.CarType, c.CarSize, ps.SlotStatus
      FROM ParkingRecord pr
      JOIN Car c ON pr.PlateNumber = c.PlateNumber
      JOIN ParkingSlot ps ON pr.SlotNumber = ps.SlotNumber
      ORDER BY pr.EntryTime DESC
    `);
    
    res.status(200).json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get active parking records (where ExitTime is NULL)
router.get('/active', verifyToken, async (req, res) => {
  try {
    const [records] = await db.query(`
      SELECT pr.*, c.DriverName, c.PhoneNumber, c.CarType, c.CarSize, ps.SlotStatus
      FROM ParkingRecord pr
      JOIN Car c ON pr.PlateNumber = c.PlateNumber
      JOIN ParkingSlot ps ON pr.SlotNumber = ps.SlotNumber
      WHERE pr.ExitTime IS NULL
      ORDER BY pr.EntryTime DESC
    `);
    
    res.status(200).json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get parking record by ID
router.get('/:parkingId', verifyToken, async (req, res) => {
  try {
    const [records] = await db.query(`
      SELECT pr.*, c.DriverName, c.PhoneNumber, c.CarType, c.CarSize, ps.SlotStatus
      FROM ParkingRecord pr
      JOIN Car c ON pr.PlateNumber = c.PlateNumber
      JOIN ParkingSlot ps ON pr.SlotNumber = ps.SlotNumber
      WHERE pr.ParkingID = ?
    `, [req.params.parkingId]);
    
    if (records.length === 0) {
      return res.status(404).json({ message: 'Parking record not found' });
    }
    
    res.status(200).json(records[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add new parking record (car entry)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { PlateNumber, SlotNumber } = req.body;
    
    // Check if car exists
    const [cars] = await db.query('SELECT * FROM Car WHERE PlateNumber = ?', [PlateNumber]);
    if (cars.length === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    // Check if slot exists and is available
    const [slots] = await db.query('SELECT * FROM ParkingSlot WHERE SlotNumber = ?', [SlotNumber]);
    if (slots.length === 0) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }
    
    if (slots[0].SlotStatus === 'occupied') {
      return res.status(400).json({ message: 'Parking slot is already occupied' });
    }
    
    // Check if car is already parked
    const [activeRecords] = await db.query('SELECT * FROM ParkingRecord WHERE PlateNumber = ? AND ExitTime IS NULL', [PlateNumber]);
    if (activeRecords.length > 0) {
      return res.status(400).json({ message: 'This car is already parked in slot ' + activeRecords[0].SlotNumber });
    }
    
    // Start a transaction
    await db.query('START TRANSACTION');
    
    try {
      // Update slot status to occupied
      await db.query('UPDATE ParkingSlot SET SlotStatus = "occupied" WHERE SlotNumber = ?', [SlotNumber]);
      
      // Add parking record
      const [result] = await db.query(
        'INSERT INTO ParkingRecord (PlateNumber, SlotNumber, EntryTime) VALUES (?, ?, NOW())',
        [PlateNumber, SlotNumber]
      );
      
      // Commit transaction
      await db.query('COMMIT');
      
      res.status(201).json({
        message: 'Car parked successfully',
        parkingId: result.insertId
      });
    } catch (err) {
      // Rollback transaction in case of error
      await db.query('ROLLBACK');
      throw err;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update parking record for car exit
router.put('/:parkingId/exit', verifyToken, async (req, res) => {
  try {
    const parkingId = req.params.parkingId;
    
    // Check if parking record exists and is active
    const [records] = await db.query('SELECT * FROM ParkingRecord WHERE ParkingID = ? AND ExitTime IS NULL', [parkingId]);
    
    if (records.length === 0) {
      return res.status(404).json({ message: 'Active parking record not found' });
    }
    
    const parkingRecord = records[0];
    
    // Start a transaction
    await db.query('START TRANSACTION');
    
    try {
      // Update slot status to available
      await db.query('UPDATE ParkingSlot SET SlotStatus = "available" WHERE SlotNumber = ?', [parkingRecord.SlotNumber]);
      
      // Calculate duration in minutes
      const [durationResult] = await db.query('SELECT TIMESTAMPDIFF(MINUTE, ?, NOW()) AS Duration', [parkingRecord.EntryTime]);
      const duration = durationResult[0].Duration;
      
      // Update parking record with exit time and duration
      await db.query(
        'UPDATE ParkingRecord SET ExitTime = NOW(), Duration = ? WHERE ParkingID = ?',
        [duration, parkingId]
      );
      
      // Commit transaction
      await db.query('COMMIT');
      
      res.status(200).json({
        message: 'Car exit recorded successfully',
        duration: duration
      });
    } catch (err) {
      // Rollback transaction in case of error
      await db.query('ROLLBACK');
      throw err;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete parking record
router.delete('/:parkingId', verifyToken, async (req, res) => {
  try {
    const parkingId = req.params.parkingId;
    
    // Check if parking record exists
    const [records] = await db.query('SELECT * FROM ParkingRecord WHERE ParkingID = ?', [parkingId]);
    
    if (records.length === 0) {
      return res.status(404).json({ message: 'Parking record not found' });
    }
    
    const parkingRecord = records[0];
    
    // If it's an active record, free the slot
    if (parkingRecord.ExitTime === null) {
      await db.query('UPDATE ParkingSlot SET SlotStatus = "available" WHERE SlotNumber = ?', [parkingRecord.SlotNumber]);
    }
    
    // Delete parking record
    await db.query('DELETE FROM ParkingRecord WHERE ParkingID = ?', [parkingId]);
    
    res.status(200).json({ message: 'Parking record deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 