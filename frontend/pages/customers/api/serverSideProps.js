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

    //prepare for GET based on the page that was landed on
    const currentPathName = context.resolvedUrl;
    const requestURL = "http://127.0.0.1:8080".concat(currentPathName);
    const request = {
        method: "GET",
        headers: { "Authorization": "Bearer " + accessToken },
    };
    let data = '';

    try {
        const response = await fetch(requestURL, request);
        if (response.headers.get("Content-Type") !== "application/json") {
            throw new Error("Response is not json");
        }

        data = await response.json();
        const responseMessage = data.message || '';

        //GET response error and refresh handling
        if (!response.ok) {
            console.log("HTTP error: " + responseMessage);

            if (response.status === 401) {
                if (responseMessage === "expired access token") { //NewAuthenticationErrorDueToExpiredAccessToken
                    console.log("Redirecting to refresh");
                    return {
                        redirect: {
                            destination: `/login/refresh?callbackURL=${encodeURIComponent(currentPathName)}`,
                            permanent: true,
                        },
                    };
                }
                if (responseMessage === "invalid access token") { //NewAuthenticationErrorDueToInvalidAccessToken
                    console.log("Redirecting to login");
                    return {
                        redirect: {
                            destination: `/login?errorMessage=${encodeURIComponent(responseMessage)}`,
                            permanent: false,
                        },
                    };
                }
            } else if (response.status === 403) {
                console.log("Redirecting to login");
                return {
                    redirect: {
                        destination: `/login?errorMessage=${encodeURIComponent(responseMessage)}`,
                        permanent: false,
                    }
                };
            } else if (response.status === 404) {
                return {
                    notFound: true,
                };
            } else {
                throw new Error("HTTP error: " + responseMessage);
            }
        }

    } catch (err) {
        console.log(err);
        return {
            redirect: {
                destination: '/500',
                permanent: false,
            }
        };
    }

    //GET successful
    return {
        props: {customers: data, currentPath: currentPathName},
    };
}
