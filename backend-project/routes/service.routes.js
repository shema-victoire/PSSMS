const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

// Get all service packages
router.get('/', verifyToken, async (req, res) => {
  try {
    const [services] = await db.query(`
      SELECT sp.*, c.DriverName, c.PhoneNumber, c.CarType, c.CarSize, p.PackageName, p.PackagePrice 
      FROM ServicePackage sp
      JOIN Car c ON sp.PlateNumber = c.PlateNumber
      JOIN Package p ON sp.PackageNumber = p.PackageNumber
      ORDER BY sp.ServiceDate DESC
    `);
    
    res.status(200).json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get service package by record number
router.get('/:recordNumber', verifyToken, async (req, res) => {
  try {
    const [services] = await db.query(`
      SELECT sp.*, c.DriverName, c.PhoneNumber, c.CarType, c.CarSize, p.PackageName, p.PackagePrice 
      FROM ServicePackage sp
      JOIN Car c ON sp.PlateNumber = c.PlateNumber
      JOIN Package p ON sp.PackageNumber = p.PackageNumber
      WHERE sp.RecordNumber = ?
    `, [req.params.recordNumber]);
    
    if (services.length === 0) {
      return res.status(404).json({ message: 'Service package not found' });
    }
    
    res.status(200).json(services[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add new service package
router.post('/', verifyToken, async (req, res) => {
  try {
    const { PlateNumber, PackageNumber } = req.body;
    
    // Check if car exists
    const [cars] = await db.query('SELECT * FROM Car WHERE PlateNumber = ?', [PlateNumber]);
    if (cars.length === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    // Check if package exists
    const [packages] = await db.query('SELECT * FROM Package WHERE PackageNumber = ?', [PackageNumber]);
    if (packages.length === 0) {
      return res.status(404).json({ message: 'Package not found' });
    }
    
    // Add service package to database
    const [result] = await db.query(
      'INSERT INTO ServicePackage (PlateNumber, PackageNumber) VALUES (?, ?)',
      [PlateNumber, PackageNumber]
    );
    
    res.status(201).json({ 
      message: 'Service package added successfully',
      recordNumber: result.insertId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update service package
router.put('/:recordNumber', verifyToken, async (req, res) => {
  try {
    const { PlateNumber, PackageNumber } = req.body;
    const recordNumber = req.params.recordNumber;
    
    // Check if service package exists
    const [existingServices] = await db.query('SELECT * FROM ServicePackage WHERE RecordNumber = ?', [recordNumber]);
    if (existingServices.length === 0) {
      return res.status(404).json({ message: 'Service package not found' });
    }
    
    // Check if car exists
    const [cars] = await db.query('SELECT * FROM Car WHERE PlateNumber = ?', [PlateNumber]);
    if (cars.length === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    // Check if package exists
    const [packages] = await db.query('SELECT * FROM Package WHERE PackageNumber = ?', [PackageNumber]);
    if (packages.length === 0) {
      return res.status(404).json({ message: 'Package not found' });
    }
    
    // Update service package in database
    await db.query(
      'UPDATE ServicePackage SET PlateNumber = ?, PackageNumber = ? WHERE RecordNumber = ?',
      [PlateNumber, PackageNumber, recordNumber]
    );
    
    res.status(200).json({ message: 'Service package updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete service package
router.delete('/:recordNumber', verifyToken, async (req, res) => {
  try {
    const recordNumber = req.params.recordNumber;
    
    // Check if service package exists
    const [existingServices] = await db.query('SELECT * FROM ServicePackage WHERE RecordNumber = ?', [recordNumber]);
    if (existingServices.length === 0) {
      return res.status(404).json({ message: 'Service package not found' });
    }
    
    // Delete service package from database
    await db.query('DELETE FROM ServicePackage WHERE RecordNumber = ?', [recordNumber]);
    
    res.status(200).json({ message: 'Service package deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 