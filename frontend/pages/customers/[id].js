import Head from 'next/head'
import Header from "../../components/header";
import { parse } from "cookie"

export async function getServerSideProps(context) {
    //get cookies
    const rawCookies = context.req.headers.cookie || ''
    const cookies = parse(rawCookies)
    const accessToken = cookies.access_token || ''
    const refreshToken = cookies.refresh_token || ''

    if (accessToken === '' || refreshToken === '') {
        console.log("no cookies set")
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            }
        }
    }

    //GET customer request
    const request = {
        method: "GET",
        headers: { "Authorization": "Bearer " + accessToken }
    };
    let data = ''
    try {
        const response = await fetch("http://127.0.0.1:8080/customers/" + context.query.id, request)

        if (!response.ok) {
            console.log("HTTP error: " + response.statusText)

            if (response.status === 401 || response.status === 403) {
                console.log("Redirecting to login")
                return {
                    redirect: {
                        destination: '/login',
                        permanent: false,
                    }
                }
            } else if (response.status === 404) {
                return {
                    notFound: true,
                }
            } else {
                throw new Error("HTTP error: " + response.statusText)
            }
        }

        data = await response.json()

    } catch (err) {
        console.log(err)
        return {
            redirect: {
                destination: '/500',
                permanent: false,
            }
        }
    }

    return {
        props: {customer: data},
    }
}

export default function CustomerHomePage(props) {
    return (
        <div>
            <Head>
                <title>Banking App - Home</title>
                <link rel="icon" type="image/png" href="/favicon-16x16.png" />
            </Head>

            <div>
                <Header title="Personal Information"/>

                <div>
                    <div>
                        <p>Full Name: {props.customer["full_name"]}</p>
                        <ul>
                            <li>Date of Birth: {props.customer["date_of_birth"]}</li>
                            <li>City: {props.customer["city"]}</li>
                            <li>Zip Code: {props.customer["zipcode"]}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
