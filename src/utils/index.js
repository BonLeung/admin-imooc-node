const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('../utils/constant')

// md5
function md5(str) {
  return crypto.createHash('md5')
    .update(String(str))
    .digest('hex')
}

// 解析 token
function decode(token) {
  if (token.indexOf('Bearer') > -1) {
    token = token.replace('Bearer ', '')
  }
  return jwt.verify(token, PRIVATE_KEY)
}

module.exports = {
  md5,
  decode
}