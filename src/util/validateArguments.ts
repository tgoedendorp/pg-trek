import {SupportedCommands, Command} from "../types/Command.ts";
import help from "../command/help.ts";
import {SupportedCreateDbObjectTypes} from "../types/DbSchemaObjectInfo.ts";
import {logError} from "./log.ts";

/**
 * Validates the command line arguments.
 */
export default ()
    : boolean => {
    if (
        Deno.args.length === 0 ||
        !SupportedCommands.includes(Deno.args[0].trim().toLowerCase())
    ) {
        help();
        return false;
    }

    const currentCommand = Deno.args[0].trim().toLowerCase() as Command;
    const commandsWithValue: Command[] = ["rollback", "rollbackto", "create", "alter", "drop"];
    if (!commandsWithValue.includes(currentCommand)) {
        return true;
    }

    if ((currentCommand === "create" || currentCommand === "alter" || currentCommand === "drop") &&
        Deno.args.length === 1) {
        logError(`A command option for ${currentCommand} is missing. Please use one of the following options: ${SupportedCreateDbObjectTypes.join(", ")}`);
        help();
        return false;
    }

    const missingValueErrorText =
        `A value for command "${currentCommand}" is missing.`;
    if (Deno.args.length === 1) {
        logError(missingValueErrorText);
        help();
        return false;
    }

    const commandValue = Deno.args[1].trim().toLowerCase();
    if (commandValue.length === 0) {
        logError(missingValueErrorText);
        help();
        return false;
    }

    if ((currentCommand === "create" || currentCommand === "alter" || currentCommand === "drop") &&
        !SupportedCreateDbObjectTypes.includes(commandValue.toLowerCase())) {
        logError(`The ${currentCommand} command option ${commandValue} is not supported. Please use one of the following options: ${SupportedCreateDbObjectTypes.join(", ")}`);
        help();
        return false;
    }

    return true;
};
