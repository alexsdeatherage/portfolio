const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// JWT secret - should be set in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Admin credentials - should be set in environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Hash password
const hashPassword = async (password) => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

// Compare password with hash
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

// Extract token from Authorization header
const extractToken = (event) => {
  const authHeader = event.headers?.authorization || event.headers?.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

// Middleware to check if user is authenticated
const requireAuth = async (event) => {
  const token = extractToken(event);
  if (!token) {
    return {
      statusCode: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'No token provided' }),
    };
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return {
      statusCode: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Invalid or expired token' }),
    };
  }

  return null; // Auth successful, continue
};

// CORS headers for auth endpoints
const authCorsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  requireAuth,
  authCorsHeaders,
  ADMIN_USERNAME,
  ADMIN_PASSWORD_HASH,
};
