const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

// Get all parking slots
router.get('/', verifyToken, async (req, res) => {
  try {
    const [slots] = await db.query('SELECT * FROM ParkingSlot ORDER BY SlotNumber');
    res.status(200).json(slots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get available parking slots
router.get('/available', verifyToken, async (req, res) => {
  try {
    const [slots] = await db.query('SELECT * FROM ParkingSlot WHERE SlotStatus = "available" ORDER BY SlotNumber');
    res.status(200).json(slots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get occupied parking slots
router.get('/occupied', verifyToken, async (req, res) => {
  try {
    const [slots] = await db.query('SELECT * FROM ParkingSlot WHERE SlotStatus = "occupied" ORDER BY SlotNumber');
    res.status(200).json(slots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get parking slot by number
router.get('/:slotNumber', verifyToken, async (req, res) => {
  try {
    const [slots] = await db.query('SELECT * FROM ParkingSlot WHERE SlotNumber = ?', [req.params.slotNumber]);
    
    if (slots.length === 0) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }
    
    res.status(200).json(slots[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add new parking slot
router.post('/', verifyToken, async (req, res) => {
  try {
    const { SlotStatus } = req.body;
    
    // Add parking slot to database
    const [result] = await db.query(
      'INSERT INTO ParkingSlot (SlotStatus) VALUES (?)',
      [SlotStatus || 'available']
    );
    
    res.status(201).json({ 
      message: 'Parking slot added successfully',
      slotNumber: result.insertId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update parking slot status
router.put('/:slotNumber', verifyToken, async (req, res) => {
  try {
    const { SlotStatus } = req.body;
    const slotNumber = req.params.slotNumber;
    
    // Check if parking slot exists
    const [existingSlots] = await db.query('SELECT * FROM ParkingSlot WHERE SlotNumber = ?', [slotNumber]);
    
    if (existingSlots.length === 0) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }
    
    // Update parking slot in database
    await db.query(
      'UPDATE ParkingSlot SET SlotStatus = ? WHERE SlotNumber = ?',
      [SlotStatus, slotNumber]
    );
    
    res.status(200).json({ message: 'Parking slot updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete parking slot
router.delete('/:slotNumber', verifyToken, async (req, res) => {
  try {
    const slotNumber = req.params.slotNumber;
    
    // Check if parking slot exists
    const [existingSlots] = await db.query('SELECT * FROM ParkingSlot WHERE SlotNumber = ?', [slotNumber]);
    
    if (existingSlots.length === 0) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }
    
    // Check if parking slot is in use
    const [parkingRecords] = await db.query('SELECT * FROM ParkingRecord WHERE SlotNumber = ? AND ExitTime IS NULL', [slotNumber]);
    
    if (parkingRecords.length > 0) {
      return res.status(400).json({ message: 'Cannot delete parking slot that is currently in use' });
    }
    
    // Delete parking slot from database
    await db.query('DELETE FROM ParkingSlot WHERE SlotNumber = ?', [slotNumber]);
    
    res.status(200).json({ message: 'Parking slot deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 