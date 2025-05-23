const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

// Get all parking payments
router.get('/', verifyToken, async (req, res) => {
  try {
    const [payments] = await db.query(`
      SELECT ps.*, c.DriverName, c.PhoneNumber, c.CarType
      FROM PSPayment ps
      JOIN Car c ON ps.PlateNumber = c.PlateNumber
      ORDER BY ps.PaymentDate DESC
    `);
    
    res.status(200).json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get parking payment by payment number
router.get('/:paymentNumber', verifyToken, async (req, res) => {
  try {
    const [payments] = await db.query(`
      SELECT ps.*, c.DriverName, c.PhoneNumber, c.CarType
      FROM PSPayment ps
      JOIN Car c ON ps.PlateNumber = c.PlateNumber
      WHERE ps.PaymentNumber = ?
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

// Get payments by plate number
router.get('/car/:plateNumber', verifyToken, async (req, res) => {
  try {
    const [payments] = await db.query(`
      SELECT ps.*, c.DriverName, c.PhoneNumber, c.CarType
      FROM PSPayment ps
      JOIN Car c ON ps.PlateNumber = c.PlateNumber
      WHERE ps.PlateNumber = ?
      ORDER BY ps.PaymentDate DESC
    `, [req.params.plateNumber]);
    
    res.status(200).json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add new parking payment
router.post('/', verifyToken, async (req, res) => {
  try {
    const { PlateNumber, AmountPaid } = req.body;
    
    // Check if car exists
    const [cars] = await db.query('SELECT * FROM Car WHERE PlateNumber = ?', [PlateNumber]);
    
    if (cars.length === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    // Add payment to database
    const [result] = await db.query(
      'INSERT INTO PSPayment (PlateNumber, AmountPaid) VALUES (?, ?)',
      [PlateNumber, AmountPaid]
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

// Update parking payment
router.put('/:paymentNumber', verifyToken, async (req, res) => {
  try {
    const { AmountPaid } = req.body;
    const paymentNumber = req.params.paymentNumber;
    
    // Check if payment exists
    const [existingPayments] = await db.query('SELECT * FROM PSPayment WHERE PaymentNumber = ?', [paymentNumber]);
    
    if (existingPayments.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Update payment in database
    await db.query(
      'UPDATE PSPayment SET AmountPaid = ? WHERE PaymentNumber = ?',
      [AmountPaid, paymentNumber]
    );
    
    res.status(200).json({ message: 'Payment updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete parking payment
router.delete('/:paymentNumber', verifyToken, async (req, res) => {
  try {
    const paymentNumber = req.params.paymentNumber;
    
    // Check if payment exists
    const [existingPayments] = await db.query('SELECT * FROM PSPayment WHERE PaymentNumber = ?', [paymentNumber]);
    
    if (existingPayments.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Delete payment from database
    await db.query('DELETE FROM PSPayment WHERE PaymentNumber = ?', [paymentNumber]);
    
    res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 