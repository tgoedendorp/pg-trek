import {envVars} from "./envVars.ts";

/**
 * Opens the given file in the configured editor.
 * @param file The file to open.
 */
export async function openInEditor(file: string)
    : Promise<void> {
    if (envVars.codeEditor.length > 0) {
        const process = Deno.run({cmd: [envVars.codeEditor, file]});
        await process.status();
    }
}
