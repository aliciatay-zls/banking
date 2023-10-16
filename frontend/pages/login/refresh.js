import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

export default function TempRefreshPage() {
    const router = useRouter();

    const [error, setError] = useState('');
    const [cookies, setCookie, removeCookie] = useCookies(['access_token', 'refresh_token']);
    const serverSideErrorDefaultMessage = "Internal server error.";
    const clientSideErrorDefaultMessage = "Unexpected error occurred";

    useEffect(() => {
        let ignore = false;

        if (!ignore) {
            const newTokenRequest = {
                method: "POST",
                body: JSON.stringify({"access_token": cookies.access_token, "refresh_token": cookies.refresh_token}),
            };

            const tryRefresh = async () => {
                const response = await fetch("http://127.0.0.1:8181/auth/refresh", newTokenRequest);
                const data = await response.json();

                //refresh failed
                if (!response.ok) {
                    console.log("HTTP error: " + data.message);
                    if (data.message === "expired or invalid refresh token") {
                        setTimeout(() => router.replace('/login'), 3000);
                        throw new Error("Session expired or invalid. Please login again.");
                    } else {
                        setTimeout(() => router.replace('/500'), 3000);
                        throw new Error(serverSideErrorDefaultMessage);
                    }
                }

                if (!("new_access_token" in data) || data.new_access_token === "") {
                    console.log("No token in response, cannot continue");
                    setTimeout(() => router.replace('/500'), 3000);
                    throw new Error(serverSideErrorDefaultMessage);
                }

                //refresh succeeded, update token on client side
                return setCookie('access_token', data.new_access_token, {
                    path: '/',
                    maxAge: 60 * 60,
                    sameSite: 'strict',
                });
            };

            tryRefresh()
            .then(() => { //success case
                const callbackURL = router.query.callbackURL || '';
                if (callbackURL === '') {
                    console.log("Refresh successful but no callback url");
                    throw new Error(clientSideErrorDefaultMessage);
                }
                return router.replace(callbackURL);
            })
            .catch((err) => { //non-http errors
                setError(err.message);
                console.log(err);
            });
        }

        return () => {
            ignore = true;
        };
    }, []);

    return (
        <div>
            <Head>
                <title>Banking App - Home</title>
                <link rel="icon" type="image/png" href="/favicon-16x16.png" />
            </Head>

            <div>
                { !error && <div>Loading...</div> }

                { error && <div style={{ color: 'red'}}>{error}</div> }
            </div>
        </div>
    );
}