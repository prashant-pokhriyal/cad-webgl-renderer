const express = require('express')
const path = require('path')
const azure = require('./azureHandler')
const compression = require('compression')

const app = express()
const port = 3000

process.env.APP_ENV = process.argv[2]

app.use(compression({ filter: (req, res) => true }))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/ifc/getList', async (req, res) => {
  const files = await azure.getFilesName()

  res.setHeader('Content-Type', 'application/json')
  res.send({ files })
})

app.get('/ifc/:file', async (req, res) => {
  const file = await azure.fetchFile(req.params.file)
  res.header('Cache-Control', 'max-age=2592000000')
  res.send(file)
})

app.get('/xkt/getList', async (req, res) => {
  const files = require('fs').readdirSync(path.join(__dirname, 'xkt'))

  res.setHeader('Content-Type', 'application/json')
  res.send({ files })
})

app.get('/xkt/:file', async (req, res) => {
  const file = require('fs').readFileSync(path.join(__dirname, 'xkt', req.params.file))
  res.header('Cache-Control', 'max-age=2592000000')
  res.send(file)
})

app.listen(port, () => {
  console.log(`listening on port ${port} with env ${process.env.APP_ENV}`)
})
