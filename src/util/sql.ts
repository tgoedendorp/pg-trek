import {Client} from "https://deno.land/x/postgres@v0.14.2/client.ts";
import getTargetDbClient from "../db/getTargetDbClient.ts";
import fileExists from "./fileExists.ts";
import {switches} from "./switches.ts";
import log from "./log.ts";
import {envVars} from "./envVars.ts";

/**
 * SQL script execution helper.
 */
export class Sql {
    private dbClient: Client | null = null;

    constructor(client: Client | null = null) {
        if (client !== null) {
            this.dbClient = client;
        } else {
            getTargetDbClient().then(result => {
                this.dbClient = result;
            });
        }
    }

    /**
     * Executes the given query.
     * @param query The query text.
     * @example await sql.query('DELETE FROM public.contact WHERE inactive=1');
     */
    async query(query: string)
        : Promise<void> {
        if (query.trim().length === 0) {
            return;
        }

        if (switches.logVerbose) {
            log(query);
        }

        await (await this.dbClient!).queryArray(query);
    }

    /**
     * Executes the contents of the provided file against Postgres.
     * @param fileName The full path and file name of the script to execute.
     * @example await sql.file('./sqlscript/add-table.sql');
     */
    async file(fileName: string)
        : Promise<void> {
        if (!(await fileExists(fileName))) {
            throw new Error(`Can't execute the SQL query from file because no file was found on path ${fileName}`);
        }

        const query = Deno.readTextFileSync(fileName);

        if (switches.logVerbose) {
            log(fileName);
            log(query);
        }

        await this.query(query);
    }

    /**
     * Runs the sql script from the /sqlscript folder.
     * @param scriptName The name of the script, without the file extension .sql.
     * @example await sql.sqlScript('add-table');
     */
    async sqlScript(scriptName: string)
        : Promise<void> {
        return await this.file(`${envVars.migrationsSqlScriptFolder}${scriptName}.sql`);
    }

    /**
     * Runs the update script for the provided view name in the schema scripts folder.
     * If no script is found matching the provided name, an error is thrown.
     * @param name The name of the view as used in the script file name.
     * @example await sql.viewScript('public.activecustomers');
     */
    async viewScript(name: string)
        : Promise<void> {
        return await this.file(`${envVars.migrationsSchemaFolder}view/${name}.sql`);
    }

    /**
     * Runs the update script for the provided function name in the schema scripts folder.
     * If no script is found matching the provided name, an error is thrown.
     * @param name The name of the function as used in the script file name.
     * @example await sql.functionScript('public.calc_avg_salesprice');
     */
    async functionScript(name: string)
        : Promise<void> {
        return await this.file(`${envVars.migrationsSchemaFolder}function/${name}.sql`);
    }

    /**
     * Runs the update script for the provided table name in the schema scripts folder.
     * If no script is found matching the provided name, an error is thrown.
     * @param name The name of the table as used in the script file name.
     * @example await sql.tableScript("public.customer");
     */
    async tableScript(name: string)
        : Promise<void> {
        return await this.file(`${envVars.migrationsSchemaFolder}table/${name}.sql`);
    }

    /**
     * Runs the update script for the provided procedure name in the schema scripts folder.
     * If no script is found matching the provided name, an error is thrown.
     * @param name The name of the procedure as used in the script file name.
     * @example await sql.procedureScript('public.run_job');
     */
    async procedureScript(name: string)
        : Promise<void> {
        return await this.file(`${envVars.migrationsSchemaFolder}procedure/${name}.sql`);
    }

    /**
     * Runs the update script for the provided trigger name in the schema scripts folder.
     * If no script is found matching the provided name, an error is thrown.
     * @param name The name of the trigger as used in the script file name.
     * @example await sql.triggerScript('public.contact_ins_upd');
     */
    async triggerScript(name: string)
        : Promise<void> {
        return await this.file(`${envVars.migrationsSchemaFolder}trigger/${name}.sql`);
    }
}

export default new Sql();
