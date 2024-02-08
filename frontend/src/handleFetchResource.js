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
    function logErrorAndRedirect(logMsg, dest, errorMsg) {
        return {
            redirect: {
                destination: dest,
                errorMessage: errorMsg,
            }
        };
    }

    try {
        const response = await fetch(requestURL, request);
        if (response.headers.get("Content-Type") !== "application/json") {
            return logErrorAndRedirect(
                "Response is not json",
                '/500',
                "");
        }

        data = await response.json();
        const errorMessage = data?.message || '';

        //GET response error and refresh handling
        if (!response.ok) {
            if (response.status === 401) {
                if (errorMessage === "expired access token") { //NewAuthenticationErrorDueToExpiredAccessToken
                    return logErrorAndRedirect(
                        "Redirecting to refresh",
                        `/login/refresh?callbackURL=${encodeURIComponent(currentPath)}`,
                        "Refreshing session...",
                    );
                }
                if (errorMessage === "invalid access token" || errorMessage === "missing token") { //NewAuthenticationErrorDueToInvalidAccessToken
                    return logErrorAndRedirect(
                        "Redirecting to login",
                        `/login?errorMessage=${encodeURIComponent(errorMessage)}`,
                        "Session expired or invalid, please login again. Redirecting...",
                    );
                }
            } else if (response.status === 403) {
                return logErrorAndRedirect(
                    "Redirecting to login",
                    `/login?errorMessage=${encodeURIComponent(errorMessage)}`,
                    `You do not have permission to access this page. 
                            If you think this is a mistake, kindly contact us at our hotline below.\n
                            Redirecting you to Home or login...`,
                );
            } else if (response.status === 404) {
                console.log("Redirecting to 404 page");
                return {
                    notFound: true,
                };
            } else if (response.status === 400 || response.status === 422) { //for forms
                console.log("Form submission rejected: " + errorMessage);
                return {
                    redirect: { //wrap around in case unintended pages receive this code
                        statusCode: response.status,
                        isFormValidationError: true,
                        errorMessage: errorMessage,
                    }
                };
            }

            return logErrorAndRedirect(
                "HTTP error in handler: " + errorMessage,
                '/500',
                "",
            );
        }

    } catch (err) {
        return logErrorAndRedirect(
            err,
            '/500',
            "",
        );
    }

    //fetch successful
    return {
        props: {
            responseData: data,
            currentPath: currentPath,
        },
    };
}
