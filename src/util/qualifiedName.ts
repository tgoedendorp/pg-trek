import {DbObjectName} from "../types/DbObjectName.ts";

/**
 * Returns a qualified name (incl schema) for Postgresql based on the given name.
 * If the name does not contain a schema, 'public' will be assumed.
 * @param name The name to convert to a qualified name
 * @return The qualified name.
 */
export function toQualifiedName(name: string)
    : string {
    const value = (name || "").trim();
    if (value.length === 0) {
        return name;
    }

    if (value.indexOf(".") === -1) {
        return `public."${value}"`;
    }

    return value;
}

/**
 * Returns the individual parts of a qualified name.
 * @param qualifiedName The qualified name to parse.
 */
export function fromQualifiedName(qualifiedName: string)
    : DbObjectName | null {
    const name = (qualifiedName || "").trim();
    if (name.length === 0) {
        return null;
    }

    const nameParts = name.split(".");
    switch (nameParts.length) {
        case 1:
            return {
                database: null,
                schema: "public",
                objectName: name
            };
        case 2:
            return {
                database: null,
                schema: nameParts[0],
                objectName: nameParts[1]
            };
        case 3:
            return {
                database: nameParts[0],
                schema: nameParts[1],
                objectName: nameParts[2]
            };
        default:
            return null;
    }
}
