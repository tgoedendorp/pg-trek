import {SchemaObjectType} from "../types/DbSchemaObjectInfo.ts";
import fileExists from "../util/fileExists.ts";
import {openInEditor} from "../util/openInEditor.ts";
import add from "./add.ts";
import {ensureDbObjectName} from "../util/ensureDbObjectName.ts";
import {envVars} from "../util/envVars.ts";
import {logError} from "../util/log.ts";
import {confirm} from "../util/confirm.ts";
import get from "./get.ts";
import create from "./create.ts";

/**
 * Creates a new migration script and opens the matching SQL file
 * from the schema folder if it exists.
 * @param dbObjectType The database object type.
 * @param name The name of the object.
 */
export default async (dbObjectType: SchemaObjectType, name: string)
    : Promise<void> => {
    const dbObjectName = await ensureDbObjectName(dbObjectType, name);
    if (dbObjectName === null) {
        return;
    }

    const {qualifiedName, inputName } = dbObjectName;
    const objectFileName = qualifiedName.replaceAll('"', "");

    const fileName = `${envVars.migrationsSchemaFolder}${dbObjectType}/${objectFileName}.sql`;
    let scriptFileAvailable = await fileExists(fileName);
    if (!scriptFileAvailable) {
        logError(`Could not find ${dbObjectType} script "${inputName}" at ${fileName}`);
        if ((await confirm('Do you want to generate a script?'))) {
            await get(dbObjectType, inputName, false);
            scriptFileAvailable = await fileExists(fileName);

            if (!scriptFileAvailable) {
                await create(dbObjectType, inputName);
                return;
            }
        }
    }

    await add(`alter ${dbObjectType} ${inputName}`, "new-migration-from-create", dbObjectType, `${objectFileName}.sql`);
    if (!scriptFileAvailable) {
        await openInEditor(fileName);
    }
}
