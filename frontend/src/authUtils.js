import { parse } from "cookie";

export function getHomepagePath(data) {
    const clientRole = data?.role || '';
    const customerId = data?.cid || '';

    //redirect to diff pages based on role
    if (clientRole === 'admin') {
        return '/customers';
    } else if (clientRole === 'user' && customerId !== '') {
        return `/customers/${customerId}`;
    } else {
        console.log("Unknown role or no cid in response");
        return "/login";
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
