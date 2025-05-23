const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');

// Define fixed fee for parking
const PARKING_FEE = 500; // 500 RWF per parking slot

// Middleware to verify dates
const validateDates = (req, res, next) => {
  const { fromDate, toDate } = req.query;

  if (!fromDate || !toDate) {
    return res.status(400).json({ message: 'From date and to date are required' });
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(fromDate) || !dateRegex.test(toDate)) {
    return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
  }

  next();
};

// Get parking report with date filtering
router.get('/', [auth.verifyToken, validateDates], async (req, res) => {
  const { fromDate, toDate } = req.query;
  
  try {
    // Prepare parking report object
    const report = {
      fixedParkingFee: PARKING_FEE,
      totalParkings: 0,
      totalRevenue: 0,
      activeParking: 0,
      currentRevenue: 0,
      avgDuration: 0,
      parkingsByDay: []
    };

    // Get parking summary data
    const summaryQuery = `
      SELECT 
        COUNT(*) as totalParkings, 
        SUM(CASE WHEN ExitTime IS NULL THEN 1 ELSE 0 END) as activeParking,
        AVG(CASE WHEN ExitTime IS NOT NULL THEN Duration ELSE 0 END) as avgDuration
      FROM ParkingRecord
      WHERE EntryTime BETWEEN ? AND ?
    `;
    const [summaryResult] = await db.query(summaryQuery, [fromDate, toDate + ' 23:59:59']);
    
    if (summaryResult[0]) {
      report.totalParkings = summaryResult[0].totalParkings || 0;
      report.activeParking = summaryResult[0].activeParking || 0;
      report.avgDuration = summaryResult[0].avgDuration || 0;
    }

    // Calculate current revenue from active parking sessions
    // Active parking count × fixed fee
    report.currentRevenue = report.activeParking * PARKING_FEE;
    report.totalRevenue = report.currentRevenue; // Set total revenue to current revenue

    // Get parkings by day
    const dayQuery = `
      SELECT DATE(EntryTime) as date, COUNT(*) as count
      FROM ParkingRecord
      WHERE EntryTime BETWEEN ? AND ?
      GROUP BY DATE(EntryTime)
      ORDER BY date
    `;
    const [dayResult] = await db.query(dayQuery, [fromDate, toDate + ' 23:59:59']);
    report.parkingsByDay = dayResult;

    res.json(report);
  } catch (err) {
    console.error('Error fetching parking report:', err);
    res.status(500).json({ message: 'Error fetching parking report' });
  }
});

// Get detailed parking report with date filtering
router.get('/parking', [auth.verifyToken, validateDates], async (req, res) => {
  const { fromDate, toDate } = req.query;
  
  try {
    // Prepare parking report object
    const report = {
      fixedParkingFee: PARKING_FEE,
      totalParkings: 0,
      totalRevenue: 0,
      activeParking: 0,
      currentRevenue: 0,
      avgDuration: 0,
      parkingsByDay: []
    };

    // Get parking summary data
    const summaryQuery = `
      SELECT 
        COUNT(*) as totalParkings, 
        SUM(CASE WHEN ExitTime IS NULL THEN 1 ELSE 0 END) as activeParking,
        AVG(CASE WHEN ExitTime IS NOT NULL THEN Duration ELSE 0 END) as avgDuration
      FROM ParkingRecord
      WHERE EntryTime BETWEEN ? AND ?
    `;
    const [summaryResult] = await db.query(summaryQuery, [fromDate, toDate + ' 23:59:59']);
    
    if (summaryResult[0]) {
      report.totalParkings = summaryResult[0].totalParkings || 0;
      report.activeParking = summaryResult[0].activeParking || 0;
      report.avgDuration = summaryResult[0].avgDuration || 0;
    }

    // Calculate current revenue from active parking sessions
    // Active parking count × fixed fee
    report.currentRevenue = report.activeParking * PARKING_FEE;
    report.totalRevenue = report.currentRevenue; // Set total revenue to current revenue

    // Get parkings by day
    const dayQuery = `
      SELECT DATE(EntryTime) as date, COUNT(*) as count
      FROM ParkingRecord
      WHERE EntryTime BETWEEN ? AND ?
      GROUP BY DATE(EntryTime)
      ORDER BY date
    `;
    const [dayResult] = await db.query(dayQuery, [fromDate, toDate + ' 23:59:59']);
    report.parkingsByDay = dayResult;

    res.json(report);
  } catch (err) {
    console.error('Error fetching parking report:', err);
    res.status(500).json({ message: 'Error fetching parking report' });
  }
});

module.exports = router; 