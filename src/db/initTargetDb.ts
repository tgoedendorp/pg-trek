import {Client} from "https://deno.land/x/postgres@v0.14.2/client.ts";
import {envVars} from "../util/envVars.ts";
import createDbClient from "./createDbClient.ts";
import log from "../util/log.ts";
import {formatTemplate} from "../util/formatTemplate.ts";

/**
 * Checks if the target database exists
 * and if not attempts to create it.
 */
export default async ()
    : Promise<void> => {
    const dbName = envVars.dbName;
    let client: Client | null = null;

    try {
        client = await createDbClient("postgres");
        const queryResult = await client!.queryObject<{ name: string }>({
            text: `SELECT datname
                   FROM pg_database
                   WHERE datistemplate = false
                     AND datname = $1`,
            args: [dbName],
            fields: ["name"],
        });

        if (queryResult.rows.length === 0) {
            if (envVars.createDbIfNotExists) {
                log(`Creating database ${dbName}`);
                const query = await formatTemplate("create-database", {dbName: dbName});
                await client.queryArray(query);
                return;
            }

            throw new Error(`Database ${dbName} does not exist on ${envVars.dbServer}:${envVars.dbPort}.`);
        }
    } finally {
        if (client !== null) {
            await client.end();
        }
    }
}
