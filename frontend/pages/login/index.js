'use client' //make this a client component so can use useRouter() hook

import Head from 'next/head'
import Header from "../../components/header"
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useCookies} from "react-cookie";

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [cookies, setCookie, removeCookie] = useCookies(['access_token', 'refresh_token'])

    const router = useRouter()

    async function handleSubmit(event) {
        event.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            //login request
            const response = await fetch("http://localhost:8181/auth/login", {
                method: "POST",
                body: JSON.stringify({username: username, password: password}),
                redirect: "follow"
            })

            //convert JSON response to JS
            if (!response.ok) {
                throw new Error("HTTP error: " + response.statusText)
            }
            const data = await response.json()

            //store tokens on client side
            if (data.access_token == null || data.refresh_token == null) {
                throw new Error("No token in response, cannot continue")
            }

            //set cookies
            setCookie('access_token', data.access_token, {
                path: '/', //want cookie to be accessible on all pages
                maxAge: 60 * 60, //1 hour
                sameSite: 'strict',
            })
            setCookie('refresh_token', data.refresh_token, {
                path: '/',
                maxAge: 60 * 60,
                sameSite: 'strict',
            })

            //redirect //client side navigation
            router.push('/customers')

        } catch (err) {
            setError(err.message)
            console.log(err)
        } finally {
            setIsLoading(false)
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
                            type="text"
                            id="password"
                            name="password"
                            value={password}
                            required
                            autoComplete="off"
                            onChange={(p) => setPassword(p.target.value)}
                        />
                    </div>
                    <div>
                        {/*<button type="submit" onClick={() => router.push('/customers')}>*/}
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
