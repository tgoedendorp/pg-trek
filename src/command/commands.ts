import add from "./add.ts";
import help from "./help.ts";
import migrate from "./migrate.ts";
import rollback from "./rollback.ts";
import rollbackTo from "./rollbackTo.ts";
import get from "./get.ts";
import getDb from "./getDb.ts";
import create from "./create.ts";
import alter from "./alter.ts";
import drop from "./drop.ts";
import info from "./info.ts";
import {Command} from "../types/Command.ts";
import {SchemaObjectType} from "../types/DbSchemaObjectInfo.ts";
import {logVerbose} from "../util/log.ts";

/**
 * Describes the command execution information.
 */
export type CommandInfo = {
    command: Command | null;
    name: string;
    schemaObjectType: SchemaObjectType,
    args: string[] | null,
    overwrite: boolean
};

/**
 * The command as provided by the user on the command line.
 */
export const userInputCommand: CommandInfo = {
    command: null,
    name: "",
    schemaObjectType: "",
    args: [],
    overwrite: false
};

/**
 * Executes a command based on user input from the command line.
 */
export async function executeUserInputCommand()
    : Promise<void> {
    await executeCommand(userInputCommand);
}

/**
 * Executes the given command or shows the help text
 * if the command is unsupported.
 * @param cmd An instance of a command information object.
 */
export async function executeCommand(cmd: CommandInfo)
    : Promise<void> {
    logVerbose(`Execute command ${cmd.command}:`);
    logVerbose(cmd);

    switch (cmd.command) {
        case "migrate":
            await migrate();
            break;
        case "add":
            await add(cmd.name);
            break;
        case "rollback":
            await rollback(cmd.name);
            break;
        case "rollbackto":
            await rollbackTo(cmd.name);
            break;
        case "getdb":
            await getDb(cmd.overwrite);
            break;
        case "create":
            await create(cmd.schemaObjectType, cmd.name);
            break;
        case "alter":
            await alter(cmd.schemaObjectType, cmd.name);
            break;
        case "drop":
            await drop(cmd.schemaObjectType, cmd.name);
            break;
        case "get":
            await get(cmd.schemaObjectType, cmd.name, cmd.overwrite);
            break;
        case "info":
            await info();
            break;
        default:
            help();
            break;
    }
}

/**
 * Set the command information based on user input from the command line.
 */
function setUserInputCommand()
    : void {
    if (Deno.args.length === 0) {
        return;
    }

    userInputCommand.command = Deno.args[0].trim().toLowerCase() as Command;
    userInputCommand.args = Deno.args;
    userInputCommand.name =
        Deno.args.length >= 3
            ? Deno.args[2]
            : Deno.args.length > 1
                ? Deno.args[1]
                : "";

    userInputCommand.schemaObjectType = Deno.args.length >= 3 ? Deno.args[1].toLowerCase() as SchemaObjectType : "";
    userInputCommand.overwrite = Deno.args.findIndex(arg => arg.toLowerCase() === "-overwrite") > -1;
}

setUserInputCommand();
