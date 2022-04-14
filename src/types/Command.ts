/**
 * Supported application commands.
 */
export const SupportedCommands = [
    "migrate",
    "add",
    "rollback",
    "rollbackto",
    "create",
    "alter",
    "drop",
    "get",
    "getdb",
    "help",
    "info"];

/**
 * Application command type.
 */
export type Command =
    "migrate" |
    "add" |
    "rollback" |
    "rollbackto" |
    "create" |
    "alter" |
    "drop" |
    "get" |
    "getdb" |
    "help" |
    "info";
