const jwt = require('jsonwebtoken')
const User = require('../models/User')

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token missing' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('name email')

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' })
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    }
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token invalid' })
  }
}

module.exports = authMiddleware
