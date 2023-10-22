export default async function handler(currentPath, requestURL, request) {
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
            console.log("HTTP error: " + errorMessage);

            if (response.status === 401) {
                if (errorMessage === "expired access token") { //NewAuthenticationErrorDueToExpiredAccessToken
                    console.log("Redirecting to refresh");
                    return {
                        redirect: {
                            destination: `/login/refresh?callbackURL=${encodeURIComponent(currentPath)}`,
                            permanent: true,
                        },
                    };
                }
                if (errorMessage === "invalid access token") { //NewAuthenticationErrorDueToInvalidAccessToken
                    console.log("Redirecting to login");
                    return {
                        redirect: {
                            destination: `/login?errorMessage=${encodeURIComponent(errorMessage)}`,
                            permanent: false,
                        },
                    };
                }
            } else if (response.status === 403) {
                console.log("Redirecting to login");
                return {
                    redirect: {
                        destination: `/login?errorMessage=${encodeURIComponent(errorMessage)}`,
                        permanent: false,
                    }
                };
            } else if (response.status === 404) {
                return {
                    notFound: true,
                };
            } else {
                throw new Error("HTTP error: " + errorMessage);
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