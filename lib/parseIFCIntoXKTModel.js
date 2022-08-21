const WebIFC = require("web-ifc/web-ifc-api-node.js");

const ifcApi = new WebIFC.IfcAPI();

/**
 * Parses an IFC STEP file into an XKTModel.
 *
 * Use this when you need to combine multiple models into the same XKT file.
 *
 * @param {Arraybuffer} ifcArrayBuffer The IFC file contents.
 * @param {XKTModel} xktModel The target XKTModel. Note that the caller is responsible for finalizing the XKTModel before use.
 */
module.exports.parseIFCIntoXKTModel = async function (ifcArrayBuffer, xktModel) {

    let nextId = 0;

    await ifcApi.Init();

    const data = new Uint8Array(ifcArrayBuffer);

    const modelID = ifcApi.OpenModel("foo.ifc", data);

    const flatMeshes = ifcApi.LoadAllGeometry(modelID);

    for (let i = 0, len = flatMeshes.size(); i < len; i++) {

        const flatMesh = flatMeshes.get(i);
        const entityId = "" + flatMesh.expressID;
        const placedGeometries = flatMesh.geometries;
        const meshIds = [];

        for (let j = 0, lenj = placedGeometries.size(); j < lenj; j++) {

            const placedGeometry = placedGeometries.get(j);
            const geometryId = "" + placedGeometry.geometryExpressID;

            if (!xktModel.geometries[geometryId]) {

                const geometry = ifcApi.GetGeometry(modelID, placedGeometry.geometryExpressID);
                const vertexData = ifcApi.GetVertexArray(geometry.GetVertexData(), geometry.GetVertexDataSize());
                const indices = ifcApi.GetIndexArray(geometry.GetIndexData(), geometry.GetIndexDataSize());

                // De-interleave vertex arrays

                const positions = [];
                const normals = [];

                for (let k = 0, lenk = vertexData.length / 6; k < lenk; k++) {

                    positions.push(vertexData[k * 6 + 0]);
                    positions.push(vertexData[k * 6 + 1]);
                    positions.push(vertexData[k * 6 + 2]);

                    normals.push(vertexData[k * 6 + 3]);
                    normals.push(vertexData[k * 6 + 4]);
                    normals.push(vertexData[k * 6 + 5]);
                }

                xktModel.createGeometry({
                    geometryId: geometryId,
                    primitiveType: "triangles",
                    positions: positions,
                    normals: normals,
                    indices: indices
                });
            }

            const meshId = ("mesh" + nextId++);

            xktModel.createMesh({
                meshId: meshId,
                geometryId: geometryId,
                matrix: new Float32Array(placedGeometry.flatTransformation),
                color: [placedGeometry.color.x, placedGeometry.color.y, placedGeometry.color.z],
                opacity: placedGeometry.color.w
            });

            meshIds.push(meshId);
        }

        xktModel.createEntity({
            entityId: entityId,
            meshIds: meshIds
        });
    }
}