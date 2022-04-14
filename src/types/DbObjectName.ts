/**
 * Represents the different parts of a fully qualified Postgresql object name
 * database.schema.object
 */
export type DbObjectName = {
    database: string | null;
    schema: string;
    objectName: string
};
