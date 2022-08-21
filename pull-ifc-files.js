const azure = require('./azureHandler')
const path = require('path')
const fs = require('fs')

;(async () => {
  let fileList = await azure.getFilesName();

  fileList.forEach(async fileName =>  {
    const file = await azure.fetchFile(fileName);
    const filePath = path.join(__dirname, 'ifc', fileName);

    if (!fs.existsSync(filePath)) {
      console.log(`\nProcessing file: ${fileName}`);
      console.log(`File does not exists in local. Saving file to local`);
      fs.createWriteStream(filePath).write(Buffer.from(file));
      console.log(`${fileName} Saved!`);
    }
  })
})();
