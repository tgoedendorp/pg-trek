/**
 * Returns the current date and time in ISO format as a sortable string.
 */
export default ()
    : string => {
    return Intl.DateTimeFormat(["sv-SE"], {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        calendar: "iso8601"
    }).format(new Date())
        .replace(/[^0-9]*/g, "");
};
