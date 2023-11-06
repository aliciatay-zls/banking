import { parse } from "cookie";
import handleFetchResource from "./handleFetchResource";

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

    const loggedInData = await handleFetchResource(currentPath, checkLoggedInURL, request);
    if (!loggedInData.props) {
        return loggedInData;
    }
    const clientRole = loggedInData.props.responseData?.role || '';

    return {
        props: {
            accessToken: accessToken,
            refreshToken: refreshToken,
            clientRole: clientRole,
            currentPath: currentPath,
            requestURL: requestURL,
        },
    };
}
