const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');

// Create express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth.routes');
const carRoutes = require('./routes/car.routes');
const parkingSlotRoutes = require('./routes/parkingslot.routes');
const parkingRecordRoutes = require('./routes/parkingrecord.routes');
const psPaymentRoutes = require('./routes/pspayment.routes');
const reportRoutes = require('./routes/report.routes');

// Route middleware
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/parkingslots', parkingSlotRoutes);
app.use('/api/parkingrecords', parkingRecordRoutes);
app.use('/api/pspayments', psPaymentRoutes);
app.use('/api/reports', reportRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SmartPark API' });
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// Test database connection
(async () => {
  try {
    const [result] = await db.query('SELECT 1');
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
})(); 