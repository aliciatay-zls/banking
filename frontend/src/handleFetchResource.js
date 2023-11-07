/**
 * Sends a request to a backend API endpoint. If the request is unsuccessful, it handles the different response
 * codes and errors from the backend, otherwise it returns the response data received.
 *
 * @param currentPath {string} The relative URL of the page that the client is currently on.
 * @param requestURL {string} The API endpoint of either the resource or auth server to send the request to.
 * @param request {object} The HTTP request to send.
 */
export default async function handleFetchResource(currentPath, requestURL, request) {
    let data = '';

    try {
        const response = await fetch(requestURL, request);
        if (response.headers.get("Content-Type") !== "application/json") {
            throw new Error("Response is not json");
        }

        data = await response.json();
        const errorMessage = data?.message || '';

        //GET response error and refresh handling
        if (!response.ok) {
            if (response.status === 401) {
                if (errorMessage === "expired access token") { //NewAuthenticationErrorDueToExpiredAccessToken
                    console.log("Redirecting to refresh");
                    return {
                        redirect: {
                            destination: `/login/refresh?callbackURL=${encodeURIComponent(currentPath)}`,
                            permanent: true,
                            errorMessage: "Refreshing session...",
                        },
                    };
                }
                if (errorMessage === "invalid access token") { //NewAuthenticationErrorDueToInvalidAccessToken
                    console.log("Redirecting to login");
                    return {
                        redirect: {
                            destination: `/login?errorMessage=${encodeURIComponent(errorMessage)}`,
                            permanent: false,
                            errorMessage: "Session expired or invalid. Please login again.",
                        },
                    };
                }
            } else if (response.status === 403) {
                console.log("Redirecting to login");
                return {
                    redirect: {
                        destination: `/login?errorMessage=${encodeURIComponent(errorMessage)}`,
                        permanent: false,
                        errorMessage: `You do not have permission to access this page. 
                            If you think this is a mistake, kindly contact us at our hotline below.\n
                            Redirecting you to Home or login...`,
                    }
                };
            } else if (response.status === 404) {
                console.log("Redirecting to 404 page");
                return {
                    notFound: true,
                };
            } else {
                throw new Error("HTTP error in handler: " + errorMessage);
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

    //fetch successful
    return {
        props: {
            responseData: data,
            currentPath: currentPath,
        },
    };
}