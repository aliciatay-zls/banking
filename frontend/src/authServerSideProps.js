import { parse } from "cookie";

import handleFetchResource from "./handleFetchResource";

/**
 * Ensures the client is logged in before rendering the page. It checks that the tokens are present, then
 * uses them to retrieve information about the client that is needed for conditional rendering (role, cid).
 *
 * @param context The getServerSideProps context parameter that is passed from the getServerSideProps call above.
 */
export default async function getServerSideProps(context) {
    //get cookies
    const { req } = context;
    const rawCookies = req?.headers?.cookie || '';
    const cookies = parse(rawCookies);
    const accessToken = cookies?.access_token || '';
    const refreshToken = cookies?.refresh_token || '';

    if (accessToken === '' || refreshToken === '') {
        console.log("no cookies set");
        return {
            redirect: {
                destination: `/login?errorMessage=${encodeURIComponent("Please login.")}`,
                permanent: false,
            }
        };
    }

    const currentPath = context.resolvedUrl;
    const requestURL = "http://127.0.0.1:8080".concat(currentPath);
    const checkLoggedInURL = "http://127.0.0.1:8181/auth/continue";
    const request = {
        method: "POST",
        body: JSON.stringify({"access_token": accessToken, "refresh_token": refreshToken}),
    };

    const checkLoggedInResponse = await handleFetchResource(currentPath, checkLoggedInURL, request);
    if (!checkLoggedInResponse.props) {
        return checkLoggedInResponse;
    }

    return {
        props: {
            accessToken: accessToken,
            refreshToken: refreshToken,
            clientInfo: checkLoggedInResponse.props.responseData,
            currentPath: currentPath,
            requestURL: requestURL,
        },
    };
}
