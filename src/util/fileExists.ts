/**
 * Returns true if the given file exists on disk, false otherwise.
 * @param fileName The file name to check.
 */
export default async (fileName: string)
    : Promise<boolean> => {
    try {
        await Deno.stat(fileName);
        return true;
    } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
            return false;
        }

        throw error;
    }
};
