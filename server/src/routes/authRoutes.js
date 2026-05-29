const express = require('express')
const { body } = require('express-validator')
const { registerUser, loginUser, getMe } = require('../controllers/authController')
const authMiddleware = require('../middleware/authMiddleware')
const { isDbConnected } = require('../config/db')

const router = express.Router()

function requireDatabase(req, res, next) {
  if (!isDbConnected()) {
    return res.status(503).json({ message: 'Database is not connected yet' })
  }

  next()
}

router.post(
  '/register',
  requireDatabase,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  registerUser,
)

router.post(
  '/login',
  requireDatabase,
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  loginUser,
)

router.get('/me', requireDatabase, authMiddleware, getMe)

module.exports = router
