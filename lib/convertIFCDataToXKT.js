const {writeXKTModelToArrayBuffer, XKTModel} = require("@xeokit/xeokit-xkt-utils/dist/xeokit-xkt-utils.cjs.js");
const {parseIFCIntoXKTModel} = require("./parseIFCIntoXKTModel.js");

/**
 * Converts IFC file data into XKT file data.
 *
 * Use this for in-memory file conversion.
 *
 * @param {Arraybuffer} ifcArrayBuffer The IFC file data.
 * @param {*} [modelStats] Optional object to collect conversion statistics for the model.
 * @return {Promise<Buffer>} The XKT file data.
 */
module.exports.convertIFCDataToXKT = async function (ifcArrayBuffer, modelStats) {

    const xktModel = new XKTModel();

    await parseIFCIntoXKTModel(ifcArrayBuffer, xktModel);

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

    return xktContent;
}

