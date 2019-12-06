const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const router = require('./src/router')

const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/', function(req, res) {
  res.send('hello world')
})

app.use('/', router)

const server = app.listen(8000, function() {
  const { address, port } = server.address()
  console.log(`HTTP服务启动成功：http://${address}:${port}`)
})
