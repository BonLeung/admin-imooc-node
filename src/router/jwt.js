const jwt = require('express-jwt')
const { PRIVATE_KEY } = require('../utils/constant')
const whiteList = ['/', '/user/login', '/user/refreshToken']

module.exports = jwt({
  secret: PRIVATE_KEY,
  credentialsRequired: true
}).unless({
  path: whiteList
})