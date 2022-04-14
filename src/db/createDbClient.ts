import {Client, ConnectionString} from "https://deno.land/x/postgres@v0.14.2/mod.ts";
import {envVars} from "../util/envVars.ts";
import {switches} from "../util/switches.ts";

/**
 * Returns new instance of the database client
 * connected to the provided database name.
 * @param databaseName The name of the database to connect to.
 */
export default async (databaseName: string)
    : Promise<Client> => {
    if (databaseName.trim().length === 0) {
        throw new Error("Cannot create a database client: the value for parameter databaseName is empty");
    }

    const dbClient = new Client((switches.connectionstring?.length ?? 0) > 0
        ? switches.connectionstring as ConnectionString
        : {
        applicationName: envVars.appName,
        hostname: envVars.dbServer,
        port: envVars.dbPort,
        database: databaseName,
        user: envVars.dbUsername,
        password: envVars.dbPassword,
        connection: {
            attempts: envVars.connectionRetry,
        }
    });

    await dbClient.connect();
    return dbClient;
};
