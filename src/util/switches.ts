/**
 * Represents the state of supported switch values.
 */
export type Switch = {
    switches: string[];
    database: string | null;
    connectionstring: string | null;
    migrationsFolder: string | null;
    overwrite: boolean;
    alwaysAnswerYes: boolean;
    withMigration: boolean;
    logSilent: boolean;
    logVerbose: boolean;
}

/**
 * Checks if the switch has been set.
 * @param switchName The name of the switch to check.
 * @returns True when set, false otherwise.
 */
export function hasSwitch(switchName: string)
    : boolean {
    if ((switchName ?? "").length === 0) {
        return false;
    }

    return Deno.args.findIndex(arg => switchName.toUpperCase() === arg.toUpperCase()) > -1;
}

/**
 * Returns the value that belongs to the provided switch, null if the switch has not been set.
 * @param switchName The name of the switch.
 * @returns The value or null if the switch has not been set.
 */
export function getSwitchValue(switchName: string)
    : string | null {
    if ((switchName ?? "").length === 0) {
        return null;
    }

    const argIndex = Deno.args.findIndex(arg => switchName.toUpperCase() === arg.toUpperCase());
    if (argIndex === -1 || argIndex === Deno.args.length - 1) {
        return null;
    }

    return Deno.args[argIndex + 1];
}

/**
 * Switch values.
 */
export const switches: Switch = {
    switches: Deno.args.filter((arg) => arg[0] === "-"),
    database: getSwitchValue("-database"),
    connectionstring: getSwitchValue("-connectionstring"),
    migrationsFolder: getSwitchValue("-migrationsfolder"),
    overwrite: hasSwitch("-overwrite"),
    alwaysAnswerYes: (hasSwitch("-yes") || hasSwitch("-y")),
    withMigration: hasSwitch("-withmigration"),
    logSilent: hasSwitch("-log:silent") && !hasSwitch("-log:verbose"),
    logVerbose: hasSwitch("-log:verbose")
};
