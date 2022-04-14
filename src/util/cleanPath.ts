/**
 * Cleans the path and makes sure it ends on a path separator.
 * @param path The path to process.
 */
export function cleanPath(path: string)
    : string {
    let result = path.trim();
    if (result.length === 0) {
        return "./";
    }

    result = result.replace("\\", "/");
    if (result[result.length - 1] !== "/") {
        result += "/";
    }

    return result;
}
