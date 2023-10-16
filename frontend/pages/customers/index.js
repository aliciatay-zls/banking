import Head from 'next/head';
import Link from "next/link";
import { Fragment } from "react";
import { parse } from "cookie";

import Header from "../../components/header";

export async function getServerSideProps(context) {
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
    let requestURL = '';
    if (currentPathName === '/customers') {
        requestURL = "http://127.0.0.1:8080/customers";
    } else if ("id" in context.query && context.query.id !== '') {
        requestURL = "http://127.0.0.1:8080/customers".concat("/", context.query.id);
    }
    if (requestURL === '') {
        console.log("Unknown page trying to call getServerSideProps");
        return {
            redirect: {
                destination: `/login?errorMessage=${encodeURIComponent(clientSideDefaultErrorMessage)}`,
                permanent: true,
            }
        };
    }
    const request = {
        method: "GET",
        headers: { "Authorization": "Bearer " + accessToken },
    };
    let data = '';

    try {
        const response = await fetch(requestURL, request);
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
        props: {customers: data},
    };
}

export default function CustomersPage(props) {
    return (
        <div>
            <Head>
                <title>Banking App - Home</title>
                <link rel="icon" type="image/png" href="/favicon-16x16.png" />
            </Head>

            <div>
                <Header title="All Customers"/>

                <div>
                    { props.customers && props.customers.map((cus) => {
                        const customerId = cus["customer_id"].toString();
                        const customerName = cus["full_name"];
                        const customerDOB = cus["date_of_birth"];
                        const customerCity = cus["city"];
                        const customerZip = cus["zipcode"];
                        const customerStatus = cus["status"];

                        return (
                            <Fragment key={customerId}>
                                <p>Customer Name: {customerName}</p>
                                <ul>
                                    <li>ID: {customerId}</li>
                                    <li>DOB: {customerDOB}</li>
                                    <li>City: {customerCity}</li>
                                    <li>Zip Code: {customerZip}</li>
                                    <li>Customer Status: {customerStatus}</li>
                                </ul>
                                <Link href={"/customers".concat("/", customerId)}>
                                    <button type="button">
                                        Act on behalf of this customer
                                    </button>
                                </Link>
                            </Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
