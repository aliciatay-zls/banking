import { parse } from "cookie";

const homeAllCustomers = '/customers';
const homeRegexp = new RegExp("^\/customers\/[0-9]+$"); //e.g. /customers/2000

export function checkHomepage(path) {
    return path === homeAllCustomers || homeRegexp.test(path);
}

export function getRole(homepage) {
    if (homepage === homeAllCustomers) {
        return 'admin';
    } else if (homeRegexp.test(homepage)) {
        return 'user';
    } else {
        return '';
    }
}

export function checkIsLoggedIn(context) {
    const { req } = context;
    const rawCookies = req?.headers?.cookie || '';
    const cookies = parse(rawCookies);
    const accessToken = cookies?.access_token || '';
    const refreshToken = cookies?.refresh_token || '';

    if (accessToken !== '' && refreshToken !== '') {
        return [true, accessToken, refreshToken];
    }
    return [false, '', '']
}
