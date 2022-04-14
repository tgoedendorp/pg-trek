import {SchemaObjectType} from "../types/DbSchemaObjectInfo.ts";
import {ensureDbObjectName} from "../util/ensureDbObjectName.ts";
import fileExists from "../util/fileExists.ts";
import add from "./add.ts";
import {confirm} from "../util/confirm.ts";
import {envVars} from "../util/envVars.ts";

/**
 * Creates a new migration script with a prefilled DROP statement.
 * @param dbObjectType The database object type.
 * @param name The name of the object to delete.
 */
export default async function (dbObjectType: SchemaObjectType, name: string)
    : Promise<void> {
    const dbObjectName = await ensureDbObjectName(dbObjectType, name);
    if (dbObjectName === null) {
        return;
    }

    const {qualifiedName, inputName} = dbObjectName;
    const objectFileName = qualifiedName.replaceAll('"', "");

    const fileName = `${envVars.migrationsSchemaFolder}${dbObjectType}/${objectFileName}.sql`;
    if ((await fileExists(fileName))) {
        const removeScriptConfirmed = await confirm(`Do you want to delete the script file ${fileName}?`)
        if (removeScriptConfirmed) {
            await Deno.remove(fileName);
        }
    }

    await add(`drop ${dbObjectType} ${inputName}`, "new-migration-from-drop", dbObjectType, objectFileName);
}
