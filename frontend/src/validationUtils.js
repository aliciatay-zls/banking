import isDate from 'validator/lib/isDate';
import isEmail from 'validator/lib/isEmail';
import isFloat from "validator/lib/isFloat";
import isISO31661Alpha2 from 'validator/lib/isISO31661Alpha2';
import isPostalCode from 'validator/lib/isPostalCode';
import isStrongPassword from 'validator/lib/isStrongPassword';
import toFloat from 'validator/lib/toFloat';

import * as f from './formatUtils';

/**
 * Checks whether the given string is a float and within the range specified by min and max inclusive,
 * and if so converts the string into a float.
 * @param {string} input The user-given string.
 * @param {number} min The minimum value the input can be.
 * @param {number} max The maximum value the input can be.
 * @returns {(boolean|number)[]|(boolean|*)[]} Array of outcome and float.
 */
export function validateFloat(input, min, max) {
    if (!isFloat(input, {min: min, max: max})) {
        return [false, 0.00];
    }

    const floatInput = toFloat(input);
    if (isNaN(floatInput)) {
        return [false, 0.00];
    }
    return [true, floatInput];
}

/**
 * Checks whether the given string contains any digits.
 * @param {string} input The user-given string.
 * @returns {boolean} The outcome.
 */
export function containsNumber(input) {
    const re = new RegExp("[0-9]+");
    return re.test(input);
}

/**
 * Checks whether the given date of birth is a valid date in the ISO 8601 format, and whether it is
 * at most 100 years before the current date and at most 1 year before the current date.
 * @param {string} input The date of birth string.
 * @returns {boolean} The outcome.
 */
export function validateDOB(input) {
    if (!isDate(input, {format: 'YYYY-MM-DD', strictMode: true})) {
        return false;
    }
    const currYear = new Date().getFullYear();
    const date = new Date(input);
    return (date.getFullYear() >= currYear - 100) && (date.getFullYear() < currYear);
}

/**
 * Checks whether the given first and last names do not contain numbers and are a maximum of 100 characters long
 * when combined using a single space.
 * @param {string} first The user-given first name.
 * @param {string} last The user-given last name.
 * @returns {boolean} The outcome.
 */
export function validateName(first, last) {
    return !containsNumber(first) && !containsNumber(last)
        && f.removeSpaces(first).concat(" ", f.removeSpaces(last)).length <= 100;
}

/**
 * Checks whether the given email is a maximum of 100 characters long and is a valid email.
 * Partially checks if the email is only in ASCII (domain part only).
 * @param {string} input The user-given email.
 * @returns {boolean} The outcome.
 */
export function validateEmail(input) {
    return input.length <= 100 && isEmail(input, {allow_utf8_local_part: false});
}

/**
 * Checks whether the given country code is valid by the ISO 3166-1 alpha-2 standard.
 * @param {string} countryCode The two-letter country code.
 * @returns {boolean} The outcome.
 */
export function validateCountry(countryCode) {
    return isISO31661Alpha2(countryCode);
}

/**
 * Checks whether the given zip or postal code is a maximum of 10 characters long, and whether it is valid
 * within the country that has the given country code.
 * @param {string} input The user-given zip or postal code.
 * @param {string} countryCode The country code.
 * @returns {boolean} The outcome.
 */
export function validateZipcode(input, countryCode) {
    return input.length <= 10 && isPostalCode(input, countryCode);
}

//
/**
 * Checks whether the given username during registration starts with an alphabet, only contains alphanumeric and
 * underscore characters, is a minimum of 6 and maximum of 20 characters long.
 * @param {string} input The user-given username.
 * @returns {boolean} The outcome.
 */
export function validateNewUsername(input) {
    const re = new RegExp("^[A-Za-z]\\w{5,19}$");
    return re.test(input);
}

//
/**
 * Checks whether the given password during registration is alphanumeric only, whether it contains at least 1 digit,
 * 1 lowercase, 1 uppercase and 1 special character, and is a minimum of 12 and maximum of 64 characters long.
 * @param {string} input The user-given password.
 * @returns {boolean} The outcome.
 */
export function validateNewPassword(input) {
    return input.length <= 64 && isStrongPassword(input, {minLength: 12});
}
