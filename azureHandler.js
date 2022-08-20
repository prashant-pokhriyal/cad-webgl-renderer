const path = require('path')
const fs = require('fs')

const isLocalEnv = () => 'local' === process.env.APP_ENV

// [Node.js only] A helper method used to read a Node.js readable stream into a Buffer
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

const getFilesName = async function listBlobsFlatWithPageMarker(containerClient) {
  // some options for filtering list
  const listOptions = {
    includeMetadata: true,
    includeSnapshots: false,
    includeTags: true,
    includeVersions: false,
    prefix: '',
  }

  if (isLocalEnv()) {
    return fs.readdirSync(path.join(__dirname, 'ifcs'))
  }

  let iterator = containerClient.listBlobsFlat(listOptions).byPage()
  let response = (await iterator.next()).value

  return response.segment.blobItems.map((blob) => blob.name)
}

const fetchFile = async function fetchFilesFromAzure(containerClient, fileName) {
  if (isLocalEnv()) {
    return fs.readFileSync(path.join(__dirname, 'ifcs', fileName))
  }

  const blobClient = containerClient.getBlobClient(fileName)
  const downloadBlockBlobResponse = await blobClient.download()

  return await streamToBuffer(downloadBlockBlobResponse.readableStreamBody)
}

module.exports = {
  getFilesName,
  fetchFile,
}
