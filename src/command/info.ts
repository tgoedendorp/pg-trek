import {getLastBatch, getMigrationCount} from "../db/migrationData.ts";
import {logMessage} from "../util/log.ts";
import {envVars} from "../util/envVars.ts";

/**
 * Writes information about the last executed migrations.
 */
export default async(): Promise<void> => {
    logMessage(`Migrations folder: ${envVars.migrationsFolder}`);
    logMessage(`Migration log entry table: ${envVars.migrationTable}`);

    const migrationCount = await getMigrationCount();
    if (migrationCount == 0) {
        logMessage("There are no migration log entries");
        return;
    }

    const lastMigrations = await getLastBatch();
    logMessage(`Total number of executed migrations: ${migrationCount}`);
    logMessage(`Last migration batch ID: ${lastMigrations[0].batchId}`);
    logMessage(`Last executed migration: ${lastMigrations[0].migration}`);
    logMessage(`Executed on: ${Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'long' }).format(lastMigrations[0].dateFinished)}`);
    logMessage(`Migrations in batch ${lastMigrations[0].batchId}:`);
    lastMigrations.forEach(migration => logMessage(migration.migration));
}
