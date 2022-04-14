import {envVars} from "../util/envVars.ts";

/**
 * Writes help text to the console.
 */
export default ()
    : void => {
    console.log(
        `Welcome to ${envVars.appName} version ${envVars.appVersion}

${envVars.appName} is a tool for updating your Postgresql database

SYNTAX
deno run --allow-all main.ts [add | migrate | info | create | alter | drop | get | getdb | rollback | rollbackTo | help] [OBJECT TYPE?] [NAME?] [SWITCH?...]

COMMANDS
add [migration name]
migrate
info
create [function | procedure | table | trigger | view] [object name]
alter [function | procedure | table | trigger | view] [object name]
drop [function | procedure | table | trigger | view] [object name]
get [function | procedure | table | trigger | view] [object name]
getdb
rollback [migration ID | migration batch ID]
rollbackTo [migration ID | migration batch ID]

USAGE
deno run --allow-all main.ts add "add new languages"

deno run --allow-all main.ts migrate

deno run --allow-all main.ts migrate -database my_app

deno run --allow-all main.ts info

deno run --allow-all main.ts rollback 20211118233509_add_new_languages.ts
deno run --allow-all main.ts rollback IC728BJHS

deno run --allow-all main.ts rollbackto 20211118233509_add_new_languages.ts
deno run --allow-all main.ts rollbackto IC728BJHS

deno run --allow-all main.ts alter table public.products
deno run --allow-all main.ts get procedure public.calc_avg_price

deno run --allow-all main.ts help
`,
    );
};
