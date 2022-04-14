import help from "./help.ts";
import getIsoTimestamp from "../util/getIsoTimestamp.ts";
import toCamelCase from "../util/toCamelCase.ts";
import {envVars} from "../util/envVars.ts";
import {readLine} from "../util/readLine.ts";
import {formatTemplate} from "../util/formatTemplate.ts";
import {openInEditor} from "../util/openInEditor.ts";
import {SchemaObjectType} from "../types/DbSchemaObjectInfo.ts";
import {TemplateType} from "../types/TemplateType.ts";
import {toQualifiedName} from "../util/qualifiedName.ts";
import log, {logError} from "../util/log.ts";
import {writeTextFile} from "../util/writeFile.ts";

/**
 * Creates a new migration script.
 * @param migrationName The name of the migration to create.
 * @param templateType The migration script template to use. Defaults to new-migration.
 * @param dbObjectType Optional. The related database object type.
 * @param dbObjectName Optional. The related database object name.
 */
export default async function (
    migrationName: string,
    templateType = "new-migration",
    dbObjectType: SchemaObjectType | undefined = undefined,
    dbObjectName: string | undefined = undefined): Promise<void> {
    let inputName = migrationName;
    let cleanedName = cleanName(inputName);

    if (cleanedName.length === 0) {
        inputName = await readLine("Enter a name for the migration:");
        cleanedName = cleanName(inputName);
        if (cleanedName.length === 0) {
            logError("No valid name provided for the migration.");
            help();
            return;
        }
    }

    const timestamp = getIsoTimestamp();
    const className = `${toCamelCase(cleanedName)}${timestamp}`;
    const fileName = `${envVars.migrationsScriptFolder}${timestamp}_${cleanedName}.ts`;
    const classTemplate = await formatTemplate(
        templateType as TemplateType,
        {
            className: className,
            migrationName: inputName,
            dbObjectType: dbObjectType,
            dbObjectName: toQualifiedName(dbObjectName || "")
        }
    );

    await writeTextFile(fileName, classTemplate);
    await openInEditor(fileName);

    log(`Created migration for "${inputName}" as ${fileName}. Open this file to add your data migration logic.`);
}

/**
 * Clean up the name, so it can be used in a file name.
 * @param name The name to clean up.
 */
function cleanName(name: string | undefined)
    : string {
    return name === undefined
        ? ''
        : name
            .trim()
            .toLowerCase()
            .replace(/[^A-Za-zÀ-ÖØ-öø-ÿ0-9]/g, "_");
}
