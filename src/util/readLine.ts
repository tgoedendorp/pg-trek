import {readLines} from "https://deno.land/std/io/buffer.ts";

/**
 * Reads an input line from the console.
 * @param text The text to display when asking for input.
 */
export async function readLine(text: string)
    : Promise<string> {
    console.log(text);

    // noinspection LoopStatementThatDoesntLoopJS
    for await(const line of readLines(Deno.stdin)) {
        return line;
    }

    return '';
}
