const { querySql, queryOne } = require('../db')

function login(username, password) {
  return querySql(`select * from admin_user where username='${username}' and password='${password}'`)
}

function findUser(username) {
  return queryOne(`select id, username, nickname, avatar, role from admin_user where username='${username}'`)
}

module.exports = {
  login,
  findUser
}