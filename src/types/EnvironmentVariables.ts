/**
 * Represents the state of supported environment variables.
 */
export type EnvironmentVariables = {
    appName: string;
    appVersion: string;
    dbName: string;
    dbServer: string;
    dbPort: number;
    dbUsername: string;
    dbPassword: string;
    connectionRetry: number;
    createDbIfNotExists: boolean;
    migrationTable: string;
    migrationsFolder: string;
    migrationsScriptFolder: string;
    migrationsSchemaFolder: string;
    migrationsSqlScriptFolder: string;
    pgBinFolder: string;
    codeEditor: string;
};
