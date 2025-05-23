const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
require('dotenv').config(); // Ensure dotenv is loaded here as well

// Hard-coded fallback JWT secret in case environment variable fails
const JWT_SECRET = process.env.JWT_SECRET || 'smartpark2025securetoken';

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    // Check if username already exists
    const [existingUsers] = await db.query('SELECT * FROM Users WHERE Username = ?', [username]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Set role to 'staff' by default for self-registration for security
    const userRole = role === 'admin' ? 'staff' : role;
    
    // Save user to database
    await db.query(
      'INSERT INTO Users (Username, Password, Role) VALUES (?, ?, ?)',
      [username, hashedPassword, userRole]
    );
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user by username
    const [users] = await db.query('SELECT * FROM Users WHERE Username = ?', [username]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.Password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    
    // Generate JWT token with fallback secret
    const token = jwt.sign(
      { id: user.UserID, role: user.Role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      id: user.UserID,
      username: user.Username,
      role: user.Role,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const [users] = await db.query('SELECT UserID, Username, Role, CreatedAt FROM Users WHERE UserID = ?', [req.userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(users[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 