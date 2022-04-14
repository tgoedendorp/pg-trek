import {SchemaObjectType} from "../types/DbSchemaObjectInfo.ts";
import {formatTemplate} from "../util/formatTemplate.ts";
import fileExists from "../util/fileExists.ts";
import {openInEditor} from "../util/openInEditor.ts";
import add from "./add.ts";
import {ensureDbObjectName} from "../util/ensureDbObjectName.ts";
import log, {logError} from "../util/log.ts";
import {envVars} from "../util/envVars.ts";
import {writeTextFile} from "../util/writeFile.ts";

/**
 * Creates a new migration script and a SQL CREATE script.
 * @param dbObjectType The database object type.
 * @param name The name of the new object.
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
        logError(`A ${dbObjectType} script file for ${inputName} already exists at ${fileName}`);
        return;
    }

    const template = await formatTemplate(`create-${dbObjectType}`, {name: qualifiedName});
    await writeTextFile(fileName, template);

    await add(`create ${dbObjectType} ${inputName}`, "new-migration-from-create", dbObjectType, `${objectFileName}.sql`);
    await openInEditor(fileName);
    log(`Created ${dbObjectType} script "${inputName}" at ${fileName}`);
}
