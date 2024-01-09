import isDate from 'validator/lib/isDate';
import isEmail from 'validator/lib/isEmail';
import isFloat from "validator/lib/isFloat";
import isISO31661Alpha2 from 'validator/lib/isISO31661Alpha2';
import isPostalCode from 'validator/lib/isPostalCode';
import isStrongPassword from 'validator/lib/isStrongPassword';
import toFloat from 'validator/lib/toFloat';

export function validateFloat(input, min) {
    if (!isFloat(input, {min: min, max: 99999999.99})) {
        return [false, 0.00];
    }

    const floatInput = toFloat(input);
    if (isNaN(floatInput)) {
        return [false, 0.00];
    }
    return [true, floatInput];
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

//does not contain numbers, max 100 chars long
export function validateName(first, last) {
    return !containsNumber(first) && !containsNumber(last)
        && removeSpaces(first).concat(" ", removeSpaces(last)).length <= 100;
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

export function validateEmail(input) {
    return input.length <= 100 && isEmail(input, {allow_utf8_local_part: false});
}

export function validateCountry(countryCode) {
    return isISO31661Alpha2(countryCode);
}

export function validateZipcode(input, countryCode) {
    return input.length <= 10 && isPostalCode(input, countryCode);
}

//starts with alphabet, only alphanumeric and underscore allowed, min 6 chars and max 20 chars long
export function validateNewUsername(input) {
    const re = new RegExp("^[A-Za-z]\\w{5,19}$");
    return re.test(input);
}

//alphanumeric, at least 1 digit, 1 lowercase, 1 uppercase, 1 special char, min 12 chars and max 64 chars long
export function validateNewPassword(input) {
    return input.length <= 64 && isStrongPassword(input, {minLength: 12});
}
