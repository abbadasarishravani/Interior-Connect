const jwt = require('jsonwebtoken')
const crypto = require('crypto')

let cachedSecret

function getJwtSecret() {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET
  }
  if (!cachedSecret) {
    // Use a fixed dev secret so tokens persist across restarts
    // In production, always set JWT_SECRET in .env
    cachedSecret = 'interiorconnect-dev-secret-key-2024-fixed'
    console.warn(
      '⚠️  JWT_SECRET not set. Using fixed dev secret. Set JWT_SECRET in .env for production.',
    )
  }
  return cachedSecret
}

function createToken(user) {
  const payload = { id: user._id.toString(), role: user.role, email: user.email }
  const secret = getJwtSecret()
  const expiresIn = '7d'
  return jwt.sign(payload, secret, { expiresIn })
}

function verifyToken(token) {
  try {
    const secret = getJwtSecret()
    const decoded = jwt.verify(token, secret)
    return decoded
  } catch (err) {
    console.error('JWT verification error:', err.name, err.message)
    if (err.name === 'TokenExpiredError') {
      throw new Error('Token expired')
    } else if (err.name === 'JsonWebTokenError') {
      throw new Error('Invalid token signature')
    } else {
      throw new Error('Invalid or expired token')
    }
  }
}

module.exports = {
  getJwtSecret,
  createToken,
  verifyToken,
}
