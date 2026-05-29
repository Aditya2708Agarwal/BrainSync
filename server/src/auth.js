const jwt = require('jsonwebtoken')
const authRequired = require('./middleware/authMiddleware')

function sign(user) {
  const id = user?._id?.toString?.() || user?.id

  if (!id) {
    throw new Error('User id is required to sign a token')
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

module.exports = {
  sign,
  authRequired,
}
