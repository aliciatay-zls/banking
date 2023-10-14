import Head from 'next/head';
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

    if (accessToken === '' || refreshToken === '') {
        console.log("no cookies set");
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            }
        };
    }

    //GET all customers request
    const request = {
        method: "GET",
        headers: { "Authorization": "Bearer " + accessToken }
    };
    let data = '';

    try {
        const response = await fetch("http://127.0.0.1:8080/customers", request);
        data = await response.json();

        const responseMessage = data.message || '';

        if (!response.ok) {
            console.log("HTTP error: " + responseMessage);

            if (response.status === 401 && responseMessage === "expired access token") {
                console.log("Redirecting to refresh");
                return {
                    redirect: {
                        destination: '/customers/refresh',
                        permanent: true,
                    }
                };
            } else if (response.status === 403) {
                console.log("Redirecting to login");
                return {
                    redirect: {
                        destination: '/login',
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
                    { props.customers &&
                        props.customers.map((cus) =>
                            <Fragment key={cus["customer_id"].toString()}>
                                <p>Customer Name: {cus["full_name"]}</p>
                                <ul>
                                    <li>ID: {cus["customer_id"]}</li>
                                    <li>DOB: {cus["date_of_birth"]}</li>
                                    <li>City: {cus["city"]}</li>
                                    <li>Zip Code: {cus["zipcode"]}</li>
                                    <li>Customer Status: {cus["status"]}</li>
                                </ul>
                            </Fragment>
                        )
                    }
                </div>
            </div>
        </div>
    );
}
