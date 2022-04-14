import {getByObjectType} from "../db/schemaData.ts";
import {writeSchemaObjectsToFiles} from "../util/writeSchemaObjectToFile.ts";
import {fromQualifiedName} from "../util/qualifiedName.ts";
import {envVars} from "../util/envVars.ts";

/**
 * Generates SQL scripts in the schema folder for all
 * supported objects the configured user has access to.
 * @param overwrite If set to true overwrites any existing files.
 */
export default async function (overwrite: boolean)
    : Promise<void> {
    await Promise.all([
        processFunctions(overwrite),
        processProcedures(overwrite),
        processViews(overwrite),
        processTables(overwrite),
        processTriggers(overwrite)
    ]);
}

/**
 * Gets and processes all database tables.
 * @param overwrite If set to true, overwrites the script file if it exists.
 */
async function processTables(overwrite: boolean)
    : Promise<void> {
    const tables = await getByObjectType("table");
    if (tables.length === 0) {
        return;
    }

    const migrationLogTable = fromQualifiedName(envVars.migrationTable)!;
    await writeSchemaObjectsToFiles(tables.filter(t => `${t.schema}.${t.name}` !== `${migrationLogTable.schema}.${migrationLogTable.objectName}`), overwrite);
}

/**
 * Gets and processes all database functions.
 * @param overwrite If set to true, overwrites the script file if it exists.
 */
async function processFunctions(overwrite: boolean)
    : Promise<void> {
    await writeSchemaObjectsToFiles(await getByObjectType("function"), overwrite);
}

/**
 * Gets and processes all procedures.
 * @param overwrite If set to true, overwrites the script file if it exists.
 */
async function processProcedures(overwrite: boolean)
    : Promise<void> {
    await writeSchemaObjectsToFiles(await getByObjectType("procedure"), overwrite);
}

/**
 * Gets and processes all database triggers.
 * @param overwrite If set to true, overwrites the script file if it exists.
 */
async function processTriggers(overwrite: boolean)
    : Promise<void> {
    await writeSchemaObjectsToFiles(await getByObjectType("trigger"), overwrite);
}

/**
 * Gets and processes all database views.
 * @param overwrite If set to true, overwrites the script file if it exists.
 */
async function processViews(overwrite: boolean)
    : Promise<void> {
    await writeSchemaObjectsToFiles(await getByObjectType("view"), overwrite);
}
