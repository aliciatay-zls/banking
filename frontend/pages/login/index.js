import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { parse } from "cookie";
import { useCookies} from "react-cookie";

import ButtonAppBar from "../../components/appbar";
import Header from "../../components/header";
import getHomepagePath from "../../src/getHomepagePath";

export async function getServerSideProps(context) {
    //get cookies
    const { req } = context;
    const rawCookies = req?.headers?.cookie || '';
    const cookies = parse(rawCookies);
    const accessToken = cookies?.access_token || '';
    const refreshToken = cookies?.refresh_token || '';

    //not logged in or failed to refresh, proceed to render form to make client log in again
    if (accessToken === '' || refreshToken === '') {
        return {
            props: {},
        };
    }

    const request = {
        method: "POST",
        body: JSON.stringify({"access_token": accessToken, "refresh_token": refreshToken}),
    };
    let data = '';

    try {
        const response = await fetch("http://127.0.0.1:8181/auth/continue", request);
        if (response.headers.get("Content-Type") !== "application/json") {
            throw new Error("Response is not json");
        }

        data = await response.json();

        if (!response.ok) {
            const errorMessage = data?.message || '';

            if (response.status === 401 && errorMessage === "expired access token") { //NewAuthenticationErrorDueToExpiredAccessToken
                console.log("Redirecting to refresh");
                return {
                    redirect: {
                        destination: `/login/refresh?isFromLogin=${encodeURIComponent(true)}`,
                        permanent: true,
                    },
                };
            }

            console.log("Error while checking if already logged in: " + errorMessage);
            return {
                props: {},
            };
        }

        //already logged in, redirect to respective homepage
        return {
            redirect: {
                destination: getHomepagePath(data),
                permanent: true,
            }
        };

    } catch (err) {
        console.log(err);
        return {
            redirect: {
                destination: '/500',
                permanent: false,
            }
        };
    }
}

export default function LoginPage() {
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [cookies, setCookie, removeCookie] = useCookies(['access_token', 'refresh_token']);

    useEffect(() => {
        setError(router.query.errorMessage);
    }, [router.query.errorMessage]);

    async function handleSubmit(event) {
        event.preventDefault();
        setIsLoading(true);

        const request = {
            method: "POST",
            body: JSON.stringify({username: username, password: password}),
        };

        try {
            const response = await fetch("http://127.0.0.1:8181/auth/login", request);
            const data = await response.json();

            const responseMessage = data?.message || '';
            const accessToken = data?.access_token || '';
            const refreshToken = data?.refresh_token || '';

            if (!response.ok) {
                throw new Error("HTTP error during login: " + responseMessage);
            }

            //store tokens on client side as cookies
            if (accessToken === '' || refreshToken === '') {
                throw new Error("No token in response, cannot continue");
            }
            setCookie('access_token', accessToken, {
                path: '/', //want cookie to be accessible on all pages
                maxAge: 60 * 60, //1 hour
                sameSite: 'strict',
            });
            setCookie('refresh_token', refreshToken, {
                path: '/',
                maxAge: 60 * 60,
                sameSite: 'strict',
            });

            return router.replace(getHomepagePath(data));

        } catch (err) {
            setError(err.message);
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div>
            <Head>
                <title>Banking App - Login</title>
                <link rel="icon" type="image/png" href="/favicon-16x16.png" />
            </Head>

            <ButtonAppBar/>

            <div>
                <Header title="Welcome back"/>

                <form name="loginform" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={username}
                            required
                            autoComplete="name"
                            onChange={(u) => setUsername(u.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            required
                            autoComplete="off"
                            onChange={(p) => setPassword(p.target.value)}
                        />
                    </div>
                    <div>
                        <button type="submit">
                            {isLoading ? 'Loading...' : 'Submit'}
                        </button>
                    </div>
                </form>

                { error &&
                    <div style={{ color: 'red'}}>{error}</div>
                }
            </div>
        </div>
    );
}
