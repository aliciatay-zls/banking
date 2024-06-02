const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/**
 * Converts a date string into the DMY format "dd Month yyyy" if possible.
 * @param {string} dateStr The date string, most likely in the ISO 8601 format "yyyy-mm-dd".
 * @returns {string} The converted date string or the original date string if it was invalid.
 */
export function getReadableDate(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date.valueOf())) {
        return dateStr;
    }
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Converts a date time string into the local time if possible.
 * @param {string} dateTimeStr The date time string, most likely in the ISO 8601 format "yyyy-mm-dd 15:04:05".
 */
export function getLocalTime(dateTimeStr) {
    const date = new Date(dateTimeStr);
    if (isNaN(date.valueOf())) {
        return dateTimeStr;
    }

    const offsetMins = date.getTimezoneOffset();
    date.setHours(date.getHours() - (offsetMins / 60));
    return ""+date;
}

/**
 * Capitalizes each word in the input sentence.
 * @param {string} input The sentence.
 * @returns {string} The converted sentence or the original string if it was empty.
 */
export function capitalize(input) {
    if (input.length === 0) {
        return input;
    }
    let words = input.split(" ");
    for (let i=0; i<words.length; i++) {
        if (words[i].length > 0) {
            words[i] = words[i][0].toUpperCase().concat(words[i].slice(1));
        }
    }
    return words.join(" ");
}

/**
 * Removes any and all consecutive spaces (e.g. "  " which is 2 spaces) and leading and trailing spaces from the string.
 * @param {string} input The input string.
 * @returns {string} The converted string or the original string if it was empty.
 */
export function removeSpaces(input) {
    if (input.length === 0) {
        return input;
    }
    let words = input.trim().split(" ");
    let result = [];
    for (let i=0; i<words.length; i++) {
        if (words[i].length > 0) {
            result.push(words[i]);
        }
    }
    return result.join(" ");
}
