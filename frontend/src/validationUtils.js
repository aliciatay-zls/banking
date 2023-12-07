import isDate from 'validator/lib/isDate';
import isEmail from 'validator/lib/isEmail';
import isPostalCode from 'validator/lib/isPostalCode';

export function validateNumeric(input) {
    const re = new RegExp("^[0-9]+$");
    if (!re.test(input)) {
        return [false, null];
    }
    let integer = parseInt(input, 10);
    if (isNaN(integer)) {
        return [false, null];
    }
    return [true, integer];
}

export function containsNumber(input) {
    const re = new RegExp("[0-9]+");
    return re.test(input);
}

//allowed birthdays: 100 years before current date up to 1 year before current date
export function validateDOB(input) {
    if (!isDate(input, {format: 'YYYY-MM-DD', strictMode: true})) {
        return false;
    }
    const currYear = new Date().getFullYear();
    const date = new Date(input);
    return (date.getFullYear() >= currYear - 100) && (date.getFullYear() < currYear);
}

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

export function validateName(first, last) {
    return !containsNumber(first) && !containsNumber(last);
}

export function validateEmail(input) {
    return isEmail(input, {allow_utf8_local_part: false}) && input.length <= 100;
}

export function validateZipcode(input) {
    return isPostalCode(input, 'any') && input.length <= 10;
}

//starts with alphabet, only underscore allowed, min 6 chars and max 20 chars long
export function validateNewUsername(input) {
    const re = new RegExp("^[A-Za-z]\\w{5,19}$");
    return re.test(input);
}

//alphanumeric, at least 1 digit, 1 lowercase, 1 uppercase, 1 special char, min 12 chars and max 100 chars long
//source of regexp: https://stackoverflow.com/questions/1559751/regex-to-make-sure-that-the-string-contains-at-least-one-lower-case-char-upper
//source of strong password guidelines: https://support.microsoft.com/en-us/windows/create-and-use-strong-passwords-c5cebb49-8c53-4f5e-2bc4-fe357ca048eb
export function validateNewPassword(input) {
    const re = new RegExp("(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])((?=.*\\W)|(?=.*_))^[^ ]{12,100}$");
    return re.test(input);
}
