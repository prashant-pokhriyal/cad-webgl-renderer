const path = require('path')
const fs = require('fs')
const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob')
const ENV = require('./env.json')

const account = ENV.AZURE_ACCOUNT_NAME
const accountKey = ENV.AZURE_ACCOUNT_KEY
const containerName = ENV.AZURE_CONTAINER_NAME
const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey)
const blobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net`, sharedKeyCredential)
const containerClient = blobServiceClient.getContainerClient(containerName)
let envType = process.env.APP_ENV;

const isLocalEnv = () => 'local' === envType;

const setEnv = (environment) => envType = environment;

const streamToBuffer = async (readableStream) => {
  return new Promise((resolve, reject) => {
    const chunks = []
    readableStream.on('data', (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data))
    })
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks))
    })
    readableStream.on('error', reject)
  })
}

const getFilesName = async () => {
  // some options for filtering list
  const listOptions = {
    includeMetadata: true,
    includeSnapshots: false,
    includeTags: true,
    includeVersions: false,
    prefix: '',
  }

  if (isLocalEnv()) {
    return fs.readdirSync(path.join(__dirname, 'ifc'))
  }

  let iterator = containerClient.listBlobsFlat(listOptions).byPage()
  let response = (await iterator.next()).value

  return response.segment.blobItems.map((blob) => blob.name)
}

const fetchFile = async (fileName) => {
  if (isLocalEnv()) {
    return fs.readFileSync(path.join(__dirname, 'ifcs', fileName))
  }

  const blobClient = containerClient.getBlobClient(fileName)
  const downloadBlockBlobResponse = await blobClient.download()

  return await streamToBuffer(downloadBlockBlobResponse.readableStreamBody)
}

module.exports = {
  setEnv,
  getFilesName,
  fetchFile,
}
