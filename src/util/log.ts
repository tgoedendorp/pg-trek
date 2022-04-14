import {switches} from "./switches.ts";

/**
 * Writes text to the output window, unless silent logging is enabled.
 * @param message The message to write to the console.
 */
export default function (message: unknown)
    : void {
    if (switches.logSilent && !switches.logVerbose) {
        return;
    }

    console.log(message);
}

/**
 * Writes an error message.
 * @param error The error message to log.
 */
export function logError(error: unknown)
    : void {
    console.error(error);
}

/**
 * Writes the message to the console log regardless of the current log level setting.
 * @param message The message to write to the console.
 */
export function logMessage(message: unknown)
    : void {
    console.log(message);
}

/**
 * Writes the messages to the console only when the verbose logging is enabled.
 * @param message The message to write to the console.
 */
export function logVerbose(message: unknown)
    : void {
    if (!switches.logVerbose) {
        return;
    }

    console.log(message);
}
