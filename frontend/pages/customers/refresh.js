import { useCookies } from "react-cookie";
import Head from "next/head";
import {useEffect, useState} from "react";
import { useRouter } from "next/navigation";

export default function TempRefreshPage() {
    console.log("Landed on temporary refresh page")

    const [error, setError] = useState('')
    const router = useRouter();
    const [cookies, setCookie, removeCookie] = useCookies(['access_token', 'refresh_token'])

    useEffect(() => {
        let ignore = false

        if (!ignore) {
            const newTokenRequest = {
                method: "POST",
                body: JSON.stringify({"access_token": cookies.access_token, "refresh_token": cookies.refresh_token}),
            };
            fetch("http://127.0.0.1:8181/auth/refresh", newTokenRequest)
                .then((refreshResponse) => {
                    if (!refreshResponse.ok) {
                        throw new Error("HTTP error: " + refreshResponse.statusText)
                    }
                    return refreshResponse.json()
                })
                .then((refreshData) => {
                    //update token on client side
                    if (refreshData.new_access_token == null) {
                        throw new Error("No token in response, cannot continue")
                    }
                    return setCookie('access_token', refreshData.new_access_token, {
                        path: '/',
                        maxAge: 60 * 60,
                        sameSite: 'strict',
                    })
                })
                .then(() => {
                    router.replace('/customers')
                })
                .catch((err) => {
                    console.log(err)
                    setError(err.message)
                })
        }

        return () => {
            ignore = true
        }
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
    )
}