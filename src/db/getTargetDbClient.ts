import {Client} from "https://deno.land/x/postgres@v0.14.2/mod.ts";
import {envVars} from "../util/envVars.ts";
import createDbClient from "./createDbClient.ts";

let dbClient: Client | null = null;

/**
 * Returns an instance of the database client
 * connected to the target database.
 */
export default async ()
    : Promise<Client> => {
    if (dbClient === null) {
        dbClient = await createDbClient(envVars.dbName);
    }

    return dbClient;
};

/**
 * Closes the database connection if active.
 */
export async function closeConnection()
    : Promise<void> {
    if (dbClient == null) {
        return;
    }

    await dbClient.end();
    dbClient = null;
}
