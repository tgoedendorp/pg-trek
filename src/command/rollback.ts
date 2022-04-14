import fileExists from "../util/fileExists.ts";
import {envVars} from "../util/envVars.ts";
import {
    getMigrationsByBatchId,
    migrationExists,
    unregisterMigration,
} from "../db/migrationData.ts";
import log, {logError} from "../util/log.ts";

/**
 * Calls rollback() either on a migration when @rollbackId is
 * a migration ID or when the ID is migration batch ID on
 * all migration in the batch from newest to oldest.
 * Also deletes the migration log entry which causes the
 * migration to be executed the next time the migration
 * process is started.
 * @param rollbackId The migration ID or migration batch ID to rollback.
 */
export default async (rollbackId: string)
    : Promise<void> => {
    if (rollbackId.trim().length === 0) {
        logError("Migration name or migration batch ID missing");
        return;
    }

    const maxBatchIdLength = 15;
    if (rollbackId.length <= maxBatchIdLength) {
        await rollbackByBatchId(rollbackId.trim().toUpperCase());
        return;
    }

    let migrationId = rollbackId.trim().toLowerCase();
    if (!migrationId.endsWith(".ts")) {
        migrationId += ".ts";
    }

    await rollbackById(migrationId);
};

/**
 * Runs the rollback process on the given migration.
 * @param migrationId
 */
async function rollbackById(migrationId: string)
    : Promise<void> {
    log(`Running rollback on migration ${migrationId}`);
    const fileName = `../../${envVars.migrationsFolder}migrations/${migrationId}`;

    if (!(await fileExists(fileName))) {
        logError(`Migration ${fileName} was not found.`);
        return;
    }

    const module = await import(fileName);
    await module.default.rollback();

    if (await migrationExists(migrationId)) {
        await unregisterMigration(migrationId);
    }
}

/**
 * Runs the rollback process for the given migration batch ID.
 * @param batchId The migration batch ID to rollback.
 */
async function rollbackByBatchId(batchId: string)
    : Promise<void> {
    const migrationsInBatch = await getMigrationsByBatchId(batchId);
    if (migrationsInBatch.length === 0) {
        return;
    }

    log(`${migrationsInBatch.length} migration entries found in batch ${batchId}`);

    for (const migration of migrationsInBatch) {
        const fileName = `../../${envVars.migrationsScriptFolder}${migration.migration}`;
        if (!(await fileExists(fileName))) {
            log(`[${batchId}] No matching migration implementation found at ${fileName}`);
            await unregisterMigration(migration.migration);
            continue;
        }

        log(`[${batchId}] Running rollback on migration ${migration.migration}`);
        const module = await import(fileName);
        await module.default.rollback();
        await unregisterMigration(migration.migration);
    }

    log("Done.");
}
