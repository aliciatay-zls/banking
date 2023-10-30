import { parse } from "cookie";

export default function getServerSideProps(context) {
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

    return {
        props: {
            accessToken: accessToken,
            refreshToken: refreshToken,
            currentPath: currentPath,
            requestURL: requestURL,
        },
    };
}
