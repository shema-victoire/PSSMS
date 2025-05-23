const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

// Get all packages
router.get('/', verifyToken, async (req, res) => {
  try {
    const [packages] = await db.query('SELECT * FROM Package');
    res.status(200).json(packages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get package by number
router.get('/:packageNumber', verifyToken, async (req, res) => {
  try {
    const [packages] = await db.query('SELECT * FROM Package WHERE PackageNumber = ?', [req.params.packageNumber]);
    
    if (packages.length === 0) {
      return res.status(404).json({ message: 'Package not found' });
    }
    
    res.status(200).json(packages[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add new package
router.post('/', verifyToken, async (req, res) => {
  try {
    const { PackageName, PackageDescription, PackagePrice } = req.body;
    
    // Add package to database
    const [result] = await db.query(
      'INSERT INTO Package (PackageName, PackageDescription, PackagePrice) VALUES (?, ?, ?)',
      [PackageName, PackageDescription, PackagePrice]
    );
    
    res.status(201).json({ 
      message: 'Package added successfully',
      packageNumber: result.insertId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update package
router.put('/:packageNumber', verifyToken, async (req, res) => {
  try {
    const { PackageName, PackageDescription, PackagePrice } = req.body;
    const packageNumber = req.params.packageNumber;
    
    // Check if package exists
    const [existingPackages] = await db.query('SELECT * FROM Package WHERE PackageNumber = ?', [packageNumber]);
    
    if (existingPackages.length === 0) {
      return res.status(404).json({ message: 'Package not found' });
    }
    
    // Update package in database
    await db.query(
      'UPDATE Package SET PackageName = ?, PackageDescription = ?, PackagePrice = ? WHERE PackageNumber = ?',
      [PackageName, PackageDescription, PackagePrice, packageNumber]
    );
    
    res.status(200).json({ message: 'Package updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete package
router.delete('/:packageNumber', verifyToken, async (req, res) => {
  try {
    const packageNumber = req.params.packageNumber;
    
    // Check if package exists
    const [existingPackages] = await db.query('SELECT * FROM Package WHERE PackageNumber = ?', [packageNumber]);
    
    if (existingPackages.length === 0) {
      return res.status(404).json({ message: 'Package not found' });
    }
    
    // Delete package from database
    await db.query('DELETE FROM Package WHERE PackageNumber = ?', [packageNumber]);
    
    res.status(200).json({ message: 'Package deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 