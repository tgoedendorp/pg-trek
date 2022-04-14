import { IMigration } from "../../src/types/Migration.ts";
import sql from "../../src/util/sql.ts";
import {envVars} from "../../src/util/envVars.ts";

// Generated with command: deno run --allow-all main.ts add "undefined"
class EnablePgStats20220109102535 implements IMigration {
  async execute(): Promise<void> {
    await sql.query(`CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
ALTER DATABASE ${envVars.dbName} SET log_min_duration_statement TO 250;
`);
  }
  
  async rollback(): Promise<void> {
  }
}

export default new EnablePgStats20220109102535();
