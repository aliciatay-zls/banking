import { parse } from "cookie";

export default async function getServerSideProps(context) {
    //get cookies
    const { req } = context;
    const rawCookies = req.headers.cookie || '';
    const cookies = parse(rawCookies);
    const accessToken = cookies.access_token || '';
    const refreshToken = cookies.refresh_token || '';
    const clientSideDefaultErrorMessage = "Unexpected error occurred";

    if (accessToken === '' || refreshToken === '') {
        console.log("no cookies set");
        return {
            redirect: {
                destination: `/login?errorMessage=${encodeURIComponent(clientSideDefaultErrorMessage)}`,
                permanent: false,
            }
        };
    }

    const currentPathName = context.resolvedUrl;
    const requestURL = "http://127.0.0.1:8080".concat(currentPathName);

    return {
        props: {
            accessToken: accessToken,
            refreshToken: refreshToken,
            currentPathName: currentPathName,
            requestURL: requestURL,
        },
    };
}
