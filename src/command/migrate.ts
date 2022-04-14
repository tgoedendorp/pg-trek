import initTargetDb from "../db/initTargetDb.ts";
import getIsoTimeStamp from "../util/getIsoTimestamp.ts"
import {envVars} from "../util/envVars.ts";
import {initMigrationTable} from "../db/migrationData.ts";
import {migrationExists, registerMigration} from "../db/migrationData.ts";
import log from "../util/log.ts";

/**
 * Starts the migration process.
 */
export default async ()
    : Promise<void> => {
    await initialize();
    await processNew();

    log("Done.");
}

/**
 * Initializes the database and migration administration.
 */
async function initialize()
    : Promise<void> {
    await initTargetDb();
    await initMigrationTable();
}

/**
 * Processes all new migration scripts.
 */
async function processNew()
    : Promise<void> {
    const batchId = parseInt(getIsoTimeStamp()).toString(32).toUpperCase();
    log(`Starting migration batch with ID ${batchId}`);

    let migrationsProcessedCount = 0;
    const files = Deno.readDir(envVars.migrationsScriptFolder);
    for await (const file of files) {
        if (!(await isValidFile(file))) {
            continue;
        }

        log(`[${batchId}] Running migration ${file.name}`);
        const module = await import(`../../${envVars.migrationsScriptFolder}${file.name}`);
        const now = new Date();

        await module.default.execute();
        await registerMigration(file.name, batchId, now);
        migrationsProcessedCount++;
    }

    log(`[${batchId}] Processed ${migrationsProcessedCount} migrations`);
}

/**
 * Returns true if the given file object is a processable migration script file, false otherwise.
 * @param file The file to validate.
 */
async function isValidFile(file: Deno.DirEntry)
    : Promise<boolean> {
    return file.isFile &&
        file.name.endsWith(".ts") &&
        !(await migrationExists(file.name));
}
