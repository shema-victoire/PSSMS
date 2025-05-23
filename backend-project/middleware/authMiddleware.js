const jwt = require('jsonwebtoken');
require('dotenv').config();

// Hard-coded fallback JWT secret in case environment variable fails
const JWT_SECRET = process.env.JWT_SECRET || 'smartpark2025securetoken';

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Require Admin Role!' });
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin
}; 