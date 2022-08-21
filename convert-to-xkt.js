const azure = require('./azureHandler')
const path = require('path')
const fs = require('fs')
const { convertIFCFileToXKT } = require('./lib/convertIFCFileToXKT')

;(async () => {
  azure.setEnv('local')
  let fileList = await azure.getFilesName()
  let xktDir = path.join(__dirname, 'xkt')

  if (!fs.existsSync(xktDir)) {
    fs.mkdirSync(xktDir)
  }

  for (let fileName of fileList) {
    const ifcSource = path.join(__dirname, 'ifc', fileName)
    const xktOutput = path.join(xktDir, (fileName.match(/(.*)\.ifc/))[1] + '.xkt')
    if (!fs.existsSync(xktOutput)) {
      console.log(`\nProcessing file: ${fileName}`)
      console.log({ ifcSource, xktOutput })
      try {
        await convertIFCFileToXKT(ifcSource, xktOutput)
        console.log(`${fileName} converted!`)
      } catch (err) {
        // throw err;
        console.error(`${fileName} not converted!`)
      }
    }
  }
})()
