const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');

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

// Get combined report data with date filtering
router.get('/', [auth.verifyToken, validateDates], async (req, res) => {
  const { fromDate, toDate } = req.query;
  
  try {
    // Prepare report object
    const report = {
      carWashing: {
        totalServices: 0,
        totalRevenue: 0,
        servicesByPackage: []
      },
      parking: {
        totalParkings: 0,
        totalRevenue: 0,
        activeParking: 0,
        avgDuration: 0
      }
    };

    // Get car washing data
    const carWashingQuery = `
      SELECT COUNT(*) as totalServices, SUM(p.PackagePrice) as totalRevenue
      FROM ServicePackage sp
      JOIN Package p ON sp.PackageNumber = p.PackageNumber
      WHERE sp.ServiceDate BETWEEN ? AND ?
    `;
    const [carWashingResult] = await db.query(carWashingQuery, [fromDate, toDate + ' 23:59:59']);
    
    if (carWashingResult[0]) {
      report.carWashing.totalServices = carWashingResult[0].totalServices || 0;
      report.carWashing.totalRevenue = carWashingResult[0].totalRevenue || 0;
    }

    // Get services by package
    const servicesByPackageQuery = `
      SELECT p.PackageName, COUNT(*) as count, SUM(p.PackagePrice) as revenue
      FROM ServicePackage sp
      JOIN Package p ON sp.PackageNumber = p.PackageNumber
      WHERE sp.ServiceDate BETWEEN ? AND ?
      GROUP BY p.PackageNumber
      ORDER BY count DESC
    `;
    const [servicesByPackageResult] = await db.query(servicesByPackageQuery, [fromDate, toDate + ' 23:59:59']);
    report.carWashing.servicesByPackage = servicesByPackageResult;

    // Get parking data
    const parkingQuery = `
      SELECT 
        COUNT(*) as totalParkings, 
        SUM(CASE WHEN ExitTime IS NULL THEN 0 ELSE 500 END) as totalRevenue,
        SUM(CASE WHEN ExitTime IS NULL THEN 1 ELSE 0 END) as activeParking,
        AVG(CASE WHEN ExitTime IS NOT NULL THEN Duration ELSE 0 END) as avgDuration
      FROM ParkingRecord
      WHERE EntryTime BETWEEN ? AND ?
    `;
    const [parkingResult] = await db.query(parkingQuery, [fromDate, toDate + ' 23:59:59']);
    
    if (parkingResult[0]) {
      report.parking.totalParkings = parkingResult[0].totalParkings || 0;
      report.parking.totalRevenue = parkingResult[0].totalRevenue || 0;
      report.parking.activeParking = parkingResult[0].activeParking || 0;
      report.parking.avgDuration = parkingResult[0].avgDuration || 0;
    }

    // Get actual parking revenue from payments
    const parkingRevenueQuery = `
      SELECT SUM(AmountPaid) as totalRevenue
      FROM PSPayment
      WHERE PaymentDate BETWEEN ? AND ?
    `;
    const [parkingRevenueResult] = await db.query(parkingRevenueQuery, [fromDate, toDate + ' 23:59:59']);
    
    if (parkingRevenueResult[0] && parkingRevenueResult[0].totalRevenue) {
      report.parking.totalRevenue = parkingRevenueResult[0].totalRevenue;
    }

    res.json(report);
  } catch (err) {
    console.error('Error fetching report data:', err);
    res.status(500).json({ message: 'Error fetching report data' });
  }
});

// Get car washing report with date filtering
router.get('/carwashing', [auth.verifyToken, validateDates], async (req, res) => {
  const { fromDate, toDate } = req.query;
  
  try {
    // Prepare car washing report object
    const report = {
      totalServices: 0,
      totalRevenue: 0,
      servicesByPackage: [],
      servicesByDay: []
    };

    // Get car washing summary data
    const summaryQuery = `
      SELECT COUNT(*) as totalServices, SUM(p.PackagePrice) as totalRevenue
      FROM ServicePackage sp
      JOIN Package p ON sp.PackageNumber = p.PackageNumber
      WHERE sp.ServiceDate BETWEEN ? AND ?
    `;
    const [summaryResult] = await db.query(summaryQuery, [fromDate, toDate + ' 23:59:59']);
    
    if (summaryResult[0]) {
      report.totalServices = summaryResult[0].totalServices || 0;
      report.totalRevenue = summaryResult[0].totalRevenue || 0;
    }

    // Get services by package
    const packageQuery = `
      SELECT p.PackageName, COUNT(*) as count, SUM(p.PackagePrice) as revenue
      FROM ServicePackage sp
      JOIN Package p ON sp.PackageNumber = p.PackageNumber
      WHERE sp.ServiceDate BETWEEN ? AND ?
      GROUP BY p.PackageNumber
      ORDER BY count DESC
    `;
    const [packageResult] = await db.query(packageQuery, [fromDate, toDate + ' 23:59:59']);
    report.servicesByPackage = packageResult;

    // Get services by day
    const dayQuery = `
      SELECT DATE(sp.ServiceDate) as date, COUNT(*) as count, SUM(p.PackagePrice) as revenue
      FROM ServicePackage sp
      JOIN Package p ON sp.PackageNumber = p.PackageNumber
      WHERE sp.ServiceDate BETWEEN ? AND ?
      GROUP BY DATE(sp.ServiceDate)
      ORDER BY date
    `;
    const [dayResult] = await db.query(dayQuery, [fromDate, toDate + ' 23:59:59']);
    report.servicesByDay = dayResult;

    res.json(report);
  } catch (err) {
    console.error('Error fetching car washing report:', err);
    res.status(500).json({ message: 'Error fetching car washing report' });
  }
});

// Get parking report with date filtering
router.get('/parking', [auth.verifyToken, validateDates], async (req, res) => {
  const { fromDate, toDate } = req.query;
  
  try {
    // Prepare parking report object
    const report = {
      totalParkings: 0,
      totalRevenue: 0,
      activeParking: 0,
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

    // Get parking revenue
    const revenueQuery = `
      SELECT SUM(AmountPaid) as totalRevenue
      FROM PSPayment
      WHERE PaymentDate BETWEEN ? AND ?
    `;
    const [revenueResult] = await db.query(revenueQuery, [fromDate, toDate + ' 23:59:59']);
    
    if (revenueResult[0]) {
      report.totalRevenue = revenueResult[0].totalRevenue || 0;
    }

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