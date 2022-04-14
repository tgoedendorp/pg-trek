import rollback from "./rollback.ts";
import log, {logError} from "../util/log.ts";
import {
    getMigrationBatchIdsUntilBatchId,
    getMigrationsUntilId,
} from "../db/migrationData.ts";

/**
 * Calls rollback() on all migration until and including
 * the given migration ID or migration batch ID from newest
 * to oldest. Als deletes the migration log entry which
 * will allow the migration to be executed again the next
 * time the migration process is started.
 * @param rollbackId
 */
export default async (rollbackId: string)
    : Promise<void> => {
    if (rollbackId.trim().length === 0) {
        logError("Migration name or migration batch ID missing");
        return;
    }

    const maxBatchIdLength = 15;
    if (rollbackId.length <= maxBatchIdLength) {
        await rollbackToByBatchId(rollbackId.trim().toUpperCase());
        return;
    }

    let migrationId = rollbackId.trim().toLowerCase();
    if (!migrationId.endsWith(".ts")) {
        migrationId += ".ts";
    }

    await rollbackToById(migrationId);
};

/**
 * Runs the rollback process on all migration until
 * and including the provided migration ID from
 * newest to oldest.
 * @param migrationId The migration ID until which to rollback.
 */
async function rollbackToById(migrationId: string)
    : Promise<void> {
    const migrationsToRollback = await getMigrationsUntilId(migrationId);

    log(`Found ${migrationsToRollback.length} migrations to roll back`);
    for (const migration of migrationsToRollback) {
        await rollback(migration.migration);
    }
}

/**
 * Runs the rollback process on all migration until
 * and including the provided migration batch ID from
 * newest to oldest.
 * @param batchId The migration batch ID until which to rollback.
 */
async function rollbackToByBatchId(batchId: string)
    : Promise<void> {
    const batchIdsToRollback = await getMigrationBatchIdsUntilBatchId(batchId);

    log(`Found ${batchIdsToRollback.length} migration batch(es) to roll back (${batchIdsToRollback.join(", ")})`);
    for (const batchId of batchIdsToRollback) {
        await rollback(batchId);
    }
}
