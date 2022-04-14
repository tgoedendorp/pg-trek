import {DbSchemaObjectInfo, SchemaObjectType} from "../types/DbSchemaObjectInfo.ts";
import fileExists from "./fileExists.ts";
import log from "./log.ts";
import {writeTextFile} from "./writeFile.ts";
import {switches} from "./switches.ts";
import add from "../command/add.ts";

const outputFolders = new Map<SchemaObjectType, string>();
outputFolders.set("function", `./database/schema/function`);
outputFolders.set("procedure", `./database/schema/procedure`);
outputFolders.set("table", `./database/schema/table`);
outputFolders.set("trigger", `./database/schema/trigger`);
outputFolders.set("view", `./database/schema/view`);

/**
 * Write the schema object to a SQL script file in the appropriate schema object type folder.
 * @param schemaObject A list of DbSchemaObjectInfo items to write to file
 * @param overwrite If a script file already exists, overwrite when this parameter is set to true, skip otherwise.
 */
export async function writeSchemaObjectToFile(schemaObject: DbSchemaObjectInfo, overwrite: boolean)
    : Promise<void> {
    const objectName = `${(schemaObject.schema.length > 0 ? schemaObject.schema + "." : "")}${schemaObject.name}`;
    const filename = `${outputFolders.get(schemaObject.type)}/${objectName}.sql`;

    log(`[${schemaObject.type}] ${objectName}`);
    log(filename);

    if (!overwrite && (await fileExists(filename))) {
        log(`SKIP: File already exists.`);
        return;
    }

    await writeTextFile(filename, schemaObject.source);
    if (switches.withMigration) {
      await add(
          `${schemaObject.type}_${schemaObject.name}`,
          "new-migration-from-create",
          schemaObject.type,
          `${objectName}.sql`);
    }
}

/**
 * Writes each schema object in the list to a separate SQL script file in the appropriate schema object type folder.
 * @param schemaObjects A list of DbSchemaObjectInfo items to write to file
 * @param overwrite If a script file already exists, overwrite when this parameter is set to true, skip otherwise.
 */
export async function writeSchemaObjectsToFiles(schemaObjects: DbSchemaObjectInfo[], overwrite: boolean)
    : Promise<void> {
    if (schemaObjects.length === 0) {
        return;
    }

    await Promise.all(schemaObjects.map(schemaObject => writeSchemaObjectToFile(schemaObject, overwrite)));
}
