import getTargetDbClient from "./getTargetDbClient.ts";
import {envVars} from "../util/envVars.ts";
import {Migration} from "../types/Migration.ts";
import log from "../util/log.ts";

/**
 * Checks if the migration history log table
 * exists and creates it if it doesn't.
 */
export async function initMigrationTable()
    : Promise<void> {
    const client = await getTargetDbClient();
    const result = await client.queryObject<{ name: string }>({
        text: `SELECT TABLE_NAME
               FROM INFORMATION_SCHEMA.TABLES t
               WHERE t.TABLE_NAME = '${envVars.migrationTable}'`,
        fields: ["name"]
    });

    if (result.rows.length === 0) {
        log("Creating migration history table");
        await client.queryArray(
            `CREATE TABLE ${envVars.migrationTable}
             (
                 Migration    VARCHAR(1000) NOT NULL PRIMARY KEY,
                 BatchId      VARCHAR(50)   NOT NULL,
                 DateStarted  TIMESTAMP     NOT NULL,
                 DateFinished TIMESTAMP     NOT NULL
             )`);
    }
}

/**
 * Checks if a migration with the given name has been executed before or not.
 * @param name The name of the migration to check
 * @returns true when the migration has been executed before, false otherwise.
 */
export async function migrationExists(name: string)
    : Promise<boolean> {
    const client = await getTargetDbClient();
    const result = await client.queryObject<{ migration: string }>({
        text: `SELECT Migration
               FROM ${envVars.migrationTable}
               WHERE Migration = $1`,
        args: [name],
        fields: ["migration"]
    });

    return result.rows.length > 0;
}

/**
 * Logs the executed migration.
 * @param migration The name of the migration that has been executed.
 * @param batchId The ID of the batch the migration was executed in.
 * @param dateStarted The start date and time of the migration's execution.
 */
export async function registerMigration(
    migration: string,
    batchId: string,
    dateStarted: Date,
): Promise<void> {
    if ((await migrationExists(migration))) {
        return;
    }

    const client = await getTargetDbClient();
    await client.queryArray({
        text: `INSERT INTO ${envVars.migrationTable}
                   (Migration, BatchId, DateStarted, DateFinished)
               VALUES ($1, $2, $3, $4)`,
        args: [migration, batchId, dateStarted, new Date()]
    });
}

/**
 * Removes the log entry for the given migration. If the migration
 * script still exists upon next execution, it will be executed again.
 * @param migration The name of the migration to deregister.
 */
export async function unregisterMigration(migration: string)
    : Promise<void> {
    const client = await getTargetDbClient();
    await client.queryArray({
        text: `DELETE
               FROM ${envVars.migrationTable}
               WHERE Migration = $1`,
        args: [migration]
    });
}

/**
 * Returns a list of executed migration by the given batch ID.
 * @param batchId The ID of the migration batch.
 */
export async function getMigrationsByBatchId(batchId: string)
    : Promise<Migration[]> {
    const client = await getTargetDbClient();
    const result = await client.queryObject<Migration>({
        text: `SELECT Migration,
                      BatchId,
                      DateStarted,
                      DateFinished
               FROM ${envVars.migrationTable}
               WHERE BatchId = $1
               ORDER BY Migration DESC`,
        args: [batchId],
        fields: ["migration", "batchId", "dateStarted", "dateFinished"]
    });

    return result.rows;
}

/**
 * Returns a list of migration executed until and
 * including the provided migration.
 * @param migration The name of the last migration to list.
 */
export async function getMigrationsUntilId(migration: string)
    : Promise<Migration[]> {
    const client = await getTargetDbClient();
    const result = await client.queryObject<Migration>({
        text: `SELECT Migration,
                      BatchId,
                      DateStarted,
                      DateFinished
               FROM ${envVars.migrationTable}
               WHERE DateStarted >= (SELECT DateStarted
                                     FROM ${envVars.migrationTable}
                                     WHERE Migration = $1
                                     LIMIT 1)
               ORDER BY Migration DESC`,
        args: [migration],
        fields: ["migration", "batchId", "dateStarted", "dateFinished"]
    });

    return result.rows;
}

/**
 * Returns a list of migration for all batches executed
 * before and including the provided migration batch ID.
 * @param batchId The ID of the last migration batch to include.
 */
export async function getMigrationBatchIdsUntilBatchId(batchId: string)
    : Promise<string[]> {
    const client = await getTargetDbClient();
    const result = await client.queryObject<{ batchId: string }>({
        text: `SELECT DISTINCT BatchId
               FROM ${envVars.migrationTable}
               WHERE DateStarted >= (SELECT DateStarted
                                     FROM ${envVars.migrationTable}
                                     WHERE BatchId = $1
                                     ORDER BY DateStarted
                                     LIMIT 1)
               ORDER BY BatchId DESC`,
        args: [batchId],
        fields: ["batchId"]
    });

    return result.rows.map((row) => row.batchId);
}

/**
 * Returns the migration entries in the last executed migration batch.
 */
export async function getLastBatch()
    : Promise<Migration[]> {
    const client = await getTargetDbClient();
    const result = await client.queryObject<Migration>({
        text: `SELECT Migration,
                      BatchId,
                      DateStarted,
                      DateFinished
               FROM ${envVars.migrationTable}
               WHERE BatchId IN (SELECT BatchId
                                   FROM ${envVars.migrationTable}
                                  ORDER BY Migration DESC 
                                  LIMIT 1)
               ORDER BY Migration DESC`,
        fields: ["migration", "batchId", "dateStarted", "dateFinished"]
    });

    return result.rows;
}

/**
 * Returns the total number of migration entries.
 */
export async function getMigrationCount()
    : Promise<number> {
    const client = await getTargetDbClient();
    const result = await client.queryObject<{ count:number }>({
        text: `SELECT COUNT(*) AS count FROM ${envVars.migrationTable}`,
        fields: ["count"]
    });

    return result.rows.length === 0
        ? 0
        : result.rows[0].count;
}
