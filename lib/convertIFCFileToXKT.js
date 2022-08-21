const fs = require("fs");
const {convertIFCDataToXKT} = require("./convertIFCDataToXKT.js");

/**
 * Converts an IFC STEP file into an XKT file.
 *
 * Use this for on-disk file conversion.
 *
 * @param {String} ifcPath Path to IFC source file.
 * @param {String} xktPath Path to XKT target file.
 * @param {*} [modelStats] Optional object to collect conversion statistics for the model.
 */
module.exports.convertIFCFileToXKT = async function(ifcPath, xktPath, modelStats) {

    const ifcArrayBuffer = await fs.readFileSync(ifcPath);

    const xktContent = await convertIFCDataToXKT(ifcArrayBuffer, modelStats);

    await fs.writeFileSync(xktPath, xktContent);
}

