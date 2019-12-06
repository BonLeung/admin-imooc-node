const jwt = require('jsonwebtoken')
const { JWT_EXPIRE, JWT_REFRESH_EXPIRE, PRIVATE_KEY } = require('../utils/constant')

function generateToken(payload, options = {expiresIn: JWT_EXPIRE}) {
  const token = jwt.sign(
    payload,
    PRIVATE_KEY,
    options
  )
  return token
}

function generateRefreshToken(payload) {
  return generateToken({
    ...payload,
    grant_type: 'refresh'
  },
  {
    expiresIn: JWT_REFRESH_EXPIRE
  })
}

function verifyToken(token) {
  if (token.indexOf('Bearer') > -1) {
    token = token.replace('Bearer ', '')
  }
  try {
    return jwt.verify(token, PRIVATE_KEY)
  } catch (error) {
    return false
  }
}

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken
}