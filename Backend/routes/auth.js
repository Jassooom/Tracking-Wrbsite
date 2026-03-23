const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { readTable, insertRow, updateRow } = require('../utils/csvDb');

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'trackcore-secret';

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = readTable('users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // For demo: accept password "admin123" for any user, or match stored hash
    const valid = password === 'admin123' || await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

    updateRow('users', 'user_id', user.user_id, { last_login: new Date().toISOString() });
    const token = jwt.sign({ userId: user.user_id, role: user.role_id }, SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.user_id, name: user.full_name, email: user.email, role: user.role_id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const users = readTable('users');
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
      return res.status(400).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const newUser = insertRow('users', 'user_id', { role_id: 4, full_name: name, email, password_hash: hash, is_active: 1 });
    const token = jwt.sign({ userId: newUser.user_id, role: 4 }, SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: newUser.user_id, name, email, role: 4 } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Auth middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = router;
module.exports.auth = auth;
