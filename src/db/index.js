const mysql = require('mysql')
const config = require('./config')
const { debug } = require('../utils/constant')

function connect() {
  return mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
  })
}

function querySql(sql) {
  const connection = connect()
  debug && console.log(sql)
  return new Promise((resolve, reject) => {
    try {
      connection.query(sql, (err, results) => {
        if (err) {
          debug && console.log('查询失败，原因：', JSON.stringify(err))
          reject(err)
        } else {
          debug && console.log('查询成功', JSON.stringify(results))
          resolve(results)
        }
      })
    } catch (error) {
      reject(error)
    } finally {
      connection.end()
    }
  })
}

function queryOne(sql) {
  return new Promise((resolve, reject) => {
    querySql(sql).then(results => {
      if (results && results.length > 0) {
        resolve(results[0])
      } else {
        resolve(null)
      }
    }).catch(err => {
      reject(err)
    })
  })
}

module.exports = {
  querySql,
  queryOne
}