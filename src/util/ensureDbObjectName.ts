import {readLine} from "./readLine.ts";
import {SchemaObjectType} from "../types/DbSchemaObjectInfo.ts";
import {toQualifiedName} from "./qualifiedName.ts";
import {logError} from "./log.ts";

/**
 * Returns the database object name and if absent asks the user to provide one. If the user provides no value, null is returned.
 * @param dbObjectType The database object type
 * @param name The initial name, if any
 * @returns An object containing the qualified database object name and the object name as provided.
 */
export async function ensureDbObjectName(dbObjectType: SchemaObjectType, name: string)
    : Promise<{ qualifiedName: string, inputName: string } | null> {
    let inputName = name.trim();
    if (inputName.length === 0) {
        inputName = await readLine(`Enter a name for the ${dbObjectType}:`);
        inputName = inputName.trim();
        if (inputName.length === 0) {
            logError(`No valid ${dbObjectType} name provided.`);
            return null;
        }
    }

    return {
        qualifiedName: toQualifiedName(inputName),
        inputName: inputName
    };
}
