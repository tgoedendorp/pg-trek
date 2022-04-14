/**
 * Formats the given text to camel casing to build a proper TS class name for migration scripts.
 * @param text The text to apply camel casing on.
 */
export default (text: string)
    : string => {
    const parts = text.split("_");
    return parts.map((part) => `${part.substring(0, 1).toUpperCase()}${part.substring(1).toLowerCase()}`).join("");
};
