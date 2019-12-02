const express = require('express')

const app = express()

app.get('/', function(req, res) {
  res.send('hello world')
})

const server = app.listen(8000, function() {
  const { address, port } = server.address()
  console.log(`HTTP服务启动成功：http://${address}:${port}`)
})
