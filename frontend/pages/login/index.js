'use client'; //make this a client component

import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCookies} from "react-cookie";
import { useEffect, useState } from 'react';

import Header from "../../components/header";

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
            //login request
            const response = await fetch("http://127.0.0.1:8181/auth/login", request);
            const data = await response.json();

            const responseMessage = data?.message || '';
            const accessToken = data?.access_token || '';
            const refreshToken = data?.refresh_token || '';
            const clientRole = data?.role || '';
            const customerId = data?.cid || '';

            //convert JSON response to JS
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

            //redirect to diff pages based on role
            if (clientRole === 'admin') {
                return router.replace('/customers'); //client side navigation
            } else if (clientRole === 'user') {
                if (customerId === '') {
                    throw new Error("No cid in response, cannot continue");
                }
                return router.replace('/customers'.concat('/', customerId));
            } else {
                throw new Error("Unknown role");
            }

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

                { error && <div style={{ color: 'red'}}>{error}</div> }
            </div>
        </div>
    );
}
