const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

// Get all car washing payments
router.get('/', verifyToken, async (req, res) => {
  try {
    const [payments] = await db.query(`
      SELECT cw.*, sp.ServiceDate, c.PlateNumber, c.DriverName, p.PackageName, p.PackagePrice
      FROM CWPayment cw
      JOIN ServicePackage sp ON cw.RecordNumber = sp.RecordNumber
      JOIN Car c ON sp.PlateNumber = c.PlateNumber
      JOIN Package p ON sp.PackageNumber = p.PackageNumber
      ORDER BY cw.PaymentDate DESC
    `);
    
    res.status(200).json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get car washing payment by payment number
router.get('/:paymentNumber', verifyToken, async (req, res) => {
  try {
    const [payments] = await db.query(`
      SELECT cw.*, sp.ServiceDate, c.PlateNumber, c.DriverName, p.PackageName, p.PackagePrice
      FROM CWPayment cw
      JOIN ServicePackage sp ON cw.RecordNumber = sp.RecordNumber
      JOIN Car c ON sp.PlateNumber = c.PlateNumber
      JOIN Package p ON sp.PackageNumber = p.PackageNumber
      WHERE cw.PaymentNumber = ?
    `, [req.params.paymentNumber]);
    
    if (payments.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.status(200).json(payments[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add new car washing payment
router.post('/', verifyToken, async (req, res) => {
  try {
    const { RecordNumber, AmountPaid } = req.body;
    
    // Check if service record exists
    const [services] = await db.query(`
      SELECT sp.*, p.PackagePrice 
      FROM ServicePackage sp
      JOIN Package p ON sp.PackageNumber = p.PackageNumber
      WHERE sp.RecordNumber = ?
    `, [RecordNumber]);
    
    if (services.length === 0) {
      return res.status(404).json({ message: 'Service record not found' });
    }
    
    // Check if payment already exists for this record
    const [existingPayments] = await db.query('SELECT * FROM CWPayment WHERE RecordNumber = ?', [RecordNumber]);
    
    if (existingPayments.length > 0) {
      return res.status(400).json({ message: 'Payment already exists for this service' });
    }
    
    // Add payment to database
    const [result] = await db.query(
      'INSERT INTO CWPayment (RecordNumber, AmountPaid) VALUES (?, ?)',
      [RecordNumber, AmountPaid]
    );
    
    res.status(201).json({ 
      message: 'Payment added successfully',
      paymentNumber: result.insertId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update car washing payment
router.put('/:paymentNumber', verifyToken, async (req, res) => {
  try {
    const { AmountPaid } = req.body;
    const paymentNumber = req.params.paymentNumber;
    
    // Check if payment exists
    const [existingPayments] = await db.query('SELECT * FROM CWPayment WHERE PaymentNumber = ?', [paymentNumber]);
    
    if (existingPayments.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Update payment in database
    await db.query(
      'UPDATE CWPayment SET AmountPaid = ? WHERE PaymentNumber = ?',
      [AmountPaid, paymentNumber]
    );
    
    res.status(200).json({ message: 'Payment updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete car washing payment
router.delete('/:paymentNumber', verifyToken, async (req, res) => {
  try {
    const paymentNumber = req.params.paymentNumber;
    
    // Check if payment exists
    const [existingPayments] = await db.query('SELECT * FROM CWPayment WHERE PaymentNumber = ?', [paymentNumber]);
    
    if (existingPayments.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Delete payment from database
    await db.query('DELETE FROM CWPayment WHERE PaymentNumber = ?', [paymentNumber]);
    
    res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 