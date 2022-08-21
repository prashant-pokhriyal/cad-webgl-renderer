const express = require('express')
//requiring path and fs modules
const path = require('path')
const fs = require('fs')
const azure = require('./azureHandler')
const compression = require('compression')
const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob')
const env = require('./env.json')

const app = express()
const port = 3000
const account = env.AZURE_ACCOUNT_NAME
const accountKey = env.AZURE_ACCOUNT_KEY
const containerName = env.AZURE_CONTAINER_NAME
const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey)
const blobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net`, sharedKeyCredential)
const containerClient = blobServiceClient.getContainerClient(containerName)

process.env.APP_ENV = process.argv[2]

app.use(compression({ filter: (req, res) => true }))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/getList', async (req, res) => {
  const files = await azure.getFilesName(containerClient)

  res.setHeader('Content-Type', 'application/json')
  res.send({ files })
})

app.get('/ifcs/:file', async (req, res) => {
  const file = await azure.fetchFile(containerClient, req.params.file)
  res.header('Cache-Control', 'max-age=2592000000')
  res.send(file)
})

app.listen(port, () => {
  console.log(`listening on port ${port} with env ${process.env.APP_ENV}`)
})
