import "https://deno.land/x/dotenv/load.ts";
import {EnvironmentVariables} from "../types/EnvironmentVariables.ts";
import {switches} from "./switches.ts";
import {cleanPath} from "./cleanPath.ts";

/**
 * Validate the values in the .env file.
 */
function validate()
    : void {
    const variables = [
        "APP_NAME",
        "APP_VERSION",
        "DB_SERVER",
        "DB_PORT",
        "DB_NAME",
        "DB_USER",
        "DB_PWD",
        "CONNECTION_RETRY",
        "CREATE_DB_IF_NOT_EXISTS",
        "DB_MIGRATION_TABLE",
        "MIGRATIONS_FOLDER",
        "PG_BIN_FOLDER"];

    for (const variable of variables) {
        if (Deno.env.get(variable) === undefined) {
            throw new Error(`The variable ${variable} is not set in .env`);
        }
    }

    const numericVariables = ["DB_PORT", "CONNECTION_RETRY"];
    for (const variable of numericVariables) {
        if (isNaN(parseInt(Deno.env.get(variable)!))) {
            throw new Error(`The variable ${variable} has no valid numeric value set in .env`);
        }
    }
}

validate();

let migrationsFolder = (switches.migrationsFolder || Deno.env.get("MIGRATIONS_FOLDER")!).trim();
if (migrationsFolder.length > 0) {
    migrationsFolder = cleanPath(migrationsFolder);
}

/**
 * Environment variable values.
 */
export const envVars: EnvironmentVariables = {
    appName: Deno.env.get("APP_NAME")!,
    appVersion: Deno.env.get("APP_VERSION")!,
    dbName: switches.database || Deno.env.get("DB_NAME")!,
    dbServer: Deno.env.get("DB_SERVER")!,
    dbPort: parseInt(Deno.env.get("DB_PORT")!),
    dbUsername: Deno.env.get("DB_USER")!,
    dbPassword: Deno.env.get("DB_PWD")!,
    connectionRetry: parseInt(Deno.env.get("CONNECTION_RETRY")!),
    createDbIfNotExists: Deno.env.get("CREATE_DB_IF_NOT_EXISTS")! === "true",
    migrationTable: Deno.env.get("DB_MIGRATION_TABLE")!,
    migrationsFolder: migrationsFolder,
    migrationsScriptFolder: `${migrationsFolder}migration/`,
    migrationsSchemaFolder: `${migrationsFolder}schema/`,
    migrationsSqlScriptFolder: `${migrationsFolder}sqlscript/`,
    pgBinFolder: (Deno.env.get("PG_BIN_FOLDER")!).length > 0
        ? cleanPath(Deno.env.get("PG_BIN_FOLDER")!)
        : "",
    codeEditor: Deno.env.get("CODE_EDITOR") ?? ''
};
