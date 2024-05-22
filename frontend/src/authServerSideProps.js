import * as utils from "./authUtils";
import handleFetchResource from "./handleFetchResource";

/**
 * Ensures the client is logged in before rendering the page. It checks that the tokens are present, then
 * uses them to retrieve information about the client that is needed for conditional rendering (role, cid).
 *
 * @param context The getServerSideProps context parameter that is passed from the getServerSideProps call above.
 */
export default async function getServerSideProps(context) {
    const [isLoggedIn, accessToken, refreshToken] = utils.checkIsLoggedIn(context);

    if (!isLoggedIn) {
        return {
            redirect: {
                destination: `/login?errorMessage=${encodeURIComponent("Please login.")}`,
            }
        };
    }

    const currentPath = context.resolvedUrl;
    const requestURL = `https://${process.env.RESC_SERVER_ADDRESS}`.concat(currentPath);

    const checkLoggedInURL = `https://${process.env.AUTH_SERVER_ADDRESS}/auth/continue`;
    const request = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "access_token": accessToken, "refresh_token": refreshToken }),
    };
    const checkLoggedInResponse = await handleFetchResource(currentPath, checkLoggedInURL, request);
    if (!checkLoggedInResponse?.props) {
        return checkLoggedInResponse;
    }

    const homepage = checkLoggedInResponse?.props?.responseData?.homepage || '';
    if (!utils.checkHomepage(homepage)) {
        console.log("Homepage path is invalid");
        return {
            redirect: {
                destination: '/500',
            }
        };
    }

    return {
        props: {
            accessToken: accessToken,
            refreshToken: refreshToken,
            homepage: homepage,
            currentPath: currentPath,
            requestURL: requestURL,
            authServerAddress: process.env.AUTH_SERVER_ADDRESS,
        },
    };
}
