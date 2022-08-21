const fs = require("fs");
const {parseIFCIntoXKTModel} = require("./parseIFCIntoXKTModel.js");
const {writeXKTModelToArrayBuffer, parseMetaModelIntoXKTModel, XKTModel} = require("@xeokit/xeokit-xkt-utils/dist/xeokit-xkt-utils.cjs.js");

/**
 * Converts an IFC STEP file and JSON metadata file into an XKT file.
 *
 * This is a temporary workaround until web-ifc parses IFC properties.
 *
 * @private
 * @param {String} ifcPath Path to IFC source file.
 * @param {String} metaModelPath Path to JSON meta model file.
 * @param {String} xktPath Path to XKT target file.
 * @param {*} [modelStats] Optional object to collect conversion statistics for the model.
 * @return {Promise<void>}
 */
module.exports.convertIFCFileAndMetaModelToXKT = async function(ifcPath, metaModelPath, xktPath, modelStats) {

    const metaModelData = await fs.readFileSync(metaModelPath);
    const metaModelContent = JSON.parse(metaModelData);
    const ifcArrayBuffer = await fs.readFileSync(ifcPath);

    const xktModel = new XKTModel();

    await parseIFCIntoXKTModel(ifcArrayBuffer, xktModel);

    parseMetaModelIntoXKTModel(metaModelContent, xktModel);

    xktModel.finalize();

    const xktArrayBuffer = writeXKTModelToArrayBuffer(xktModel);

    const xktContent = Buffer.from(xktArrayBuffer);

    if (modelStats) {
        modelStats.numObjects = xktModel.entitiesList.length;
        modelStats.numGeometries = xktModel.geometriesList.length;
        modelStats.geometryReuseFactor = (modelStats.numObjects / modelStats.numGeometries).toFixed(2);;
        modelStats.ifcSizeMB = (ifcArrayBuffer.byteLength / 1048576).toFixed(2);
        modelStats.xktSizeMB = (xktArrayBuffer.byteLength / 1048576).toFixed(2);
    }

    await fs.writeFileSync(xktPath, xktContent);
}

