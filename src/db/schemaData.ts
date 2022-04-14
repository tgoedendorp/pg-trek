import getTargetDbClient from "./getTargetDbClient.ts";
import {DbSchemaObjectInfo, SchemaObjectType} from "../types/DbSchemaObjectInfo.ts";
import {fromQualifiedName} from "../util/qualifiedName.ts";
import {envVars} from "../util/envVars.ts";

const triggersQuery = `SELECT ''                       AS schema,
                              t.tgname                 AS name,
                              'trigger'                AS type,
                              pg_get_triggerdef(t.oid) AS source
                       FROM pg_trigger t
                       WHERE NOT t.tgisinternal`;

const triggerQuery = `${triggersQuery}
                      AND t.tgname = $1`;

// Procedures and functions are both routines.
const routinesQuery = `SELECT ns.nspname                AS schema,
                              p.proname                 AS name,
                              isr.routine_type          AS type,
                              pg_get_functiondef(p.OID) AS source
                       FROM pg_proc p
                                INNER JOIN pg_namespace ns
                                           ON ns.oid = p.pronamespace
                                INNER JOIN information_schema.routines isr
                                           ON isr.routine_name = p.proname
                                               AND isr.routine_schema = ns.nspname
                       WHERE ns.nspname <> 'pg_catalog'
                         AND ns.nspname <> 'information_schema'
                         AND p.proname NOT LIKE 'pg_%'`;

const proceduresQuery = `${routinesQuery}
                         AND isr.routine_type = 'p'`;

const procedureQuery = `${proceduresQuery}
                         AND ns.nspname = $1
                         AND p.proname = $2`;

const functionsQuery = `${routinesQuery}
                         AND isr.routine_type = 'f'`;

const functionQuery = `${functionsQuery}
                         AND ns.nspname = $1
                         AND p.proname = $2`;

const viewsQuery = `SELECT table_schema    AS schema,
                           table_name      AS name,
                           'view'          AS type,
                           view_definition AS source
                    FROM information_schema.views
                    WHERE table_schema <> 'pg_catalog'
                      AND table_schema <> 'information_schema'
                      AND table_name NOT LIKE 'pg_%'`;

const viewQuery = `${viewsQuery}
                   AND table_schema = $1
                   AND table_name = $2`;

const tablesQuery = `SELECT t.table_schema AS schema,
                            t.table_name   AS name,
                            'table'        AS type,
                            ''             AS source
                     FROM information_schema.tables t
                     WHERE t.table_type = 'BASE TABLE'
                       AND t.table_schema NOT LIKE 'pg_%'
                       AND t.table_schema <> 'information_schema'`;

const tableQuery = `${tablesQuery}
                    AND t.table_schema = $1
                    AND t.table_name = $2`;

const getByObjectTypeHandlers = new Map<SchemaObjectType, () => Promise<DbSchemaObjectInfo[]>>();
getByObjectTypeHandlers.set("table", getTables);
getByObjectTypeHandlers.set("view", getViews);
getByObjectTypeHandlers.set("procedure", getProcedures);
getByObjectTypeHandlers.set("function", getFunctions);
getByObjectTypeHandlers.set("trigger", getTriggers);

const getByNameHandlers = new Map<SchemaObjectType, (name: string) => Promise<DbSchemaObjectInfo | null>>();
getByNameHandlers.set("table", getTable);
getByNameHandlers.set("view", getView);
getByNameHandlers.set("procedure", getProcedure);
getByNameHandlers.set("function", getFunction);
getByNameHandlers.set("trigger", getTrigger);

/**
 * Gets information and the source of all objects of the given type.
 * @param objectType The object type.
 */
export async function getByObjectType(objectType: SchemaObjectType)
    : Promise<DbSchemaObjectInfo[]> {
    if (getByObjectTypeHandlers.has(objectType)) {
        return await getByObjectTypeHandlers.get(objectType)!();
    }

    return [];
}

/**
 * Returns information and source for the request object
 * @param objectType The object type.
 * @param name The name of the object.
 */
export async function getByName(objectType: SchemaObjectType, name: string)
    : Promise<DbSchemaObjectInfo | null> {
    if ((name ?? "").trim().length > 0 && getByNameHandlers.has(objectType)) {
        return await getByNameHandlers.get(objectType)!(name);
    }

    return null;
}

/**
 * Runs the provided query and returns the result as an array of DbSchemaObjectInfo items.
 * @param query The query text to execute against the database.
 */
async function getSchemaObjects(query: string)
    : Promise<DbSchemaObjectInfo[]> {
    const client = await getTargetDbClient();
    return (await client.queryObject<DbSchemaObjectInfo>({
        text: query,
        args: [],
        fields: ["schema", "name", "type", "source"],
    })).rows;
}

/**
 * Runs the provided query and returns the result, if any, as a DbSchemaObjectInfo item.
 * @param query The query to execute. Must contain $1 en $2 placeholders for the values of parameters schema and name.
 * @param schema The name of the schema the object is defined in.
 * @param name The object name.
 */
async function getSchemaObject(query: string, schema: string, name: string)
    : Promise<DbSchemaObjectInfo | null> {
    const client = await getTargetDbClient();
    const result = await client.queryObject<DbSchemaObjectInfo>({
        text: query,
        args: [schema, name],
        fields: ["schema", "name", "type", "source"],
    });

    return result.rows.length > 0
        ? result.rows[0]
        : null;
}

/**
 * Returns a list of DbSchemaObjectInfo for all known tables.
 */
async function getTables()
    : Promise<DbSchemaObjectInfo[]> {
    const tables = await getSchemaObjects(tablesQuery);
    if (tables.length === 0) {
        return [];
    }

    for (let count = 0; count < tables.length; count++) {
        await setTableSource(tables[count]);
    }

    return tables;
}

/**
 * Runs the pg_dump command to get the CREATE statement and assigns the result to
 * the source property in the instance provided in the tableInfo parameter.
 * @param tableInfo The DbSchemaObjectInfo to update with the CREATE statement.
 */
async function setTableSource(tableInfo: DbSchemaObjectInfo)
    : Promise<void> {
    const cmdParams = [
        `--dbname=postgresql://${envVars.dbUsername}:${envVars.dbPassword}@${envVars.dbServer}:${envVars.dbPort}/${envVars.dbName}`,
        `--schema=${tableInfo.schema}`,
        `--table=${tableInfo.name}`,
        '--schema-only',
        '--no-comments',
        '-E UTF8'
    ];

    const process = Deno.run({
        cmd: [`${envVars.pgBinFolder}pg_dump`, ...cmdParams],
        stderr: "piped",
        stdin: "piped",
        stdout: "piped"
    });

    const processStatus = await process.status();
    if (!processStatus.success) {
        console.log(`Exit code ${processStatus.code}: ${new TextDecoder().decode(await process.stderrOutput())}`);
        console.log(tableInfo);
        return;
    }

    const pgDumpOutput = new TextDecoder().decode(await process.output());
    tableInfo.source = `DO
$do$
BEGIN
IF NOT EXISTS(SELECT * FROM information_schema.tables WHERE table_schema='${tableInfo.schema}' AND table_name='${tableInfo.name}') THEN

` + pgDumpOutput
            .replace(/^--.*\s*/gm, "")
            .replace(/^SELECT pg_/gmi, "PERFORM pg_")
            .replaceAll("CREATE TABLE", `CREATE TABLE`)
        + `END IF;
END
$do$
`;
}

/**
 * Returns a list of DbSchemaObjectInfo for all known views.
 */
async function getViews()
    : Promise<DbSchemaObjectInfo[]> {
    return await getSchemaObjects(viewsQuery);
}

/**
 * Returns a list of DbSchemaObjectInfo for all known procedures.
 */
async function getProcedures()
    : Promise<DbSchemaObjectInfo[]> {
    return await getSchemaObjects(proceduresQuery);
}

/**
 * Returns a list of DbSchemaObjectInfo for all known functions.
 */
async function getFunctions()
    : Promise<DbSchemaObjectInfo[]> {
    return await getSchemaObjects(functionsQuery);
}

/**
 * Returns a list of DbSchemaObjectInfo for all known triggers.
 */
async function getTriggers()
    : Promise<DbSchemaObjectInfo[]> {
    return await getSchemaObjects(triggersQuery);
}

/**
 * Returns a DbSchemaObjectInfo instance for the requested table, if it exists.
 */
async function getTable(name: string)
    : Promise<DbSchemaObjectInfo | null> {
    const qualifiedName = fromQualifiedName(name)!;
    const tableInfo = await getSchemaObject(tableQuery, qualifiedName.schema, qualifiedName.objectName);
    if (tableInfo === null) {
        return null;
    }

    await setTableSource(tableInfo);
    return tableInfo;
}

/**
 * Returns a DbSchemaObjectInfo instance for the requested view, if it exists.
 */
async function getView(name: string)
    : Promise<DbSchemaObjectInfo | null> {
    const qualifiedName = fromQualifiedName(name)!;
    return await getSchemaObject(viewQuery, qualifiedName.schema, qualifiedName.objectName);
}

/**
 * Returns a DbSchemaObjectInfo instance for the requested procedure, if it exists.
 */
async function getProcedure(name: string)
    : Promise<DbSchemaObjectInfo | null> {
    const qualifiedName = fromQualifiedName(name)!;
    return await getSchemaObject(procedureQuery, qualifiedName.schema, qualifiedName.objectName);
}

/**
 * Returns a DbSchemaObjectInfo instance for the requested function, if it exists.
 */
async function getFunction(name: string)
    : Promise<DbSchemaObjectInfo | null> {
    const qualifiedName = fromQualifiedName(name)!;
    return await getSchemaObject(functionQuery, qualifiedName.schema, qualifiedName.objectName);
}

/**
 * Returns a DbSchemaObjectInfo instance for the requested trigger, if it exists.
 */
async function getTrigger(name: string)
    : Promise<DbSchemaObjectInfo | null> {
    const client = await getTargetDbClient();
    const result = await client.queryObject<DbSchemaObjectInfo>({
        text: triggerQuery,
        args: [name],
        fields: ["schema", "name", "type", "source"],
    });

    return result.rows.length > 0
        ? result.rows[0]
        : null;
}
