/**
 * Database schema object information type
 */
export type DbSchemaObjectInfo = {
    name: string;
    schema: string;
    source: string;
    type: SchemaObjectType;
}

/**
 * Supported schema object types.
 */
export type SchemaObjectType = "" | "function" | "procedure" | "table" | "trigger" | "view";
export const SupportedCreateDbObjectTypes = ["function", "procedure", "table", "trigger", "view"];
