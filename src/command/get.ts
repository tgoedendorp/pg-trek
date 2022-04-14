import {SchemaObjectType} from "../types/DbSchemaObjectInfo.ts";
import {getByName} from "../db/schemaData.ts";
import {writeSchemaObjectToFile} from "../util/writeSchemaObjectToFile.ts";
import {envVars} from "../util/envVars.ts";
import log from "../util/log.ts";

/**
 * Generates a SQL script for the requested database object.
 * @param schemaObjectType The database object type.
 * @param objectName The name of the object.
 * @param overwrite If set to true, overwrites the file if it already exists.
 */
export default async function (
    schemaObjectType: SchemaObjectType,
    objectName: string,
    overwrite: boolean)
    : Promise<void> {
    const schemaObject = await getByName(schemaObjectType, objectName);
    if (schemaObject !== null) {
        await writeSchemaObjectToFile(schemaObject, overwrite);
        return;
    }

    log(`No ${schemaObjectType} found with name '${objectName}'. Check the name is spelled correctly, the proper namespace has been indicated if other than public and the current database user ${envVars.dbUsername} has access to the requested object.`);
}
