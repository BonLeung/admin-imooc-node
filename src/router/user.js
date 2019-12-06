const express = require('express')
const Result = require('../models/Result')
const { login, findUser } = require('../services/user')
const { md5, decode } = require('../utils')
const { generateToken, generateRefreshToken, verifyToken } = require('../utils/token')
const { PWD_SALT } = require('../utils/constant')
const { body, validationResult } = require('express-validator')
const boom = require('boom')

const router = express.Router()

router.get('/info', function(req, res, next) {
  const decodeResult = decode(req.get('Authorization'))
  if (decodeResult && decodeResult.username) {
    findUser('admin').then(user => {
      if (user) {
        user.roles = [ user.role ]
        new Result(user, '查询用户成功').success(res)
      } else {
        new Result('用户查询失败').fail(res)
      }
    })
  } else {
    new Result('用户查询失败').fail(res)
  }
})

router.get('/refreshToken', function(req, res, next) {
  const isValidated = verifyToken(req.get('RefreshToken'))
  if (isValidated) {
    const decodeResult = decode(req.get('RefreshToken'))
    const { username } = decodeResult
    const token = generateToken({ username })
    const refresh_token = generateRefreshToken({ username })
    new Result({ token, refresh_token }, '重新登录成功').success(res) 
  } else {
    new Result('refreshToken已过期').jwtRefreshError(res)
  }
})

router.post(
  '/login', 
  [
    body('username').isString().withMessage('用户名必须为字符串'),
    body('password').isString().withMessage('密码必须为数字')
  ], 
  function(req, res, next) {
    const err = validationResult(req)
    if (!err.isEmpty()) {
      const [{msg}] = err.errors
      next(boom.badRequest(msg))
    } else {
      let { username, password } = req.body
      password = md5(`${password}${PWD_SALT}`)
      login(username, password).then(users => {
        if (!users || users.length === 0) {
          new Result('登录失败').fail(res)
        } else {
          const token = generateToken({username})
          const refresh_token = generateRefreshToken({username})
          new Result({ token, refresh_token }, '登录成功').success(res)
        }
      })
    }
  }
)

module.exports = router