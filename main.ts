import validateArguments from "./src/util/validateArguments.ts";
import {executeUserInputCommand} from "./src/command/commands.ts";
import {closeConnection} from "./src/db/getTargetDbClient.ts";

if (!validateArguments()) {
    Deno.exit(-1);
}

await executeUserInputCommand();
await closeConnection();
