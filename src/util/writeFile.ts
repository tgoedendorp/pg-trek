/**
 * Writes the provided text to a file. Overwrites the content if the file exists.
 * @param fileName The path and name of the file to write to.
 * @param content The content to write to the file.
 */
export async function writeTextFile(fileName:string, content: string): Promise<void> {
    await Deno.writeTextFile(
        fileName,
        content,
        {
        append: false,
        create: true
    });
}
