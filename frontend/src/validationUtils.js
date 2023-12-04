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

export function validateDate(input) {
    const currYear = new Date().getFullYear();
    const date = new Date(input);
    return !isNaN(date) && (date.getFullYear() >= currYear - 100) && (date.getFullYear() <= currYear);
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

//source of regexp: discussion at https://emailregex.com/#disqus_footer
//in the form xxx@xxx.xxx, max 100 chars long
export function validateNewEmail(input) {
    const re = new RegExp("[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,63}");
    return re.test(input) && input.length <= 100;
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
