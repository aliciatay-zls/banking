import Head from 'next/head'
import Header from "../../components/header";
import { parse } from "cookie"
import { useState } from "react";

export async function getServerSideProps(context) {
    //get cookies
    const { req } = context
    const rawCookies = req.headers.cookie || '' //in case cookie header is not present in the request
    const cookies = parse(rawCookies)
    const accessToken = cookies.access_token || '' //in case cookie header is present but not actual cookies
    const refreshToken = cookies.refresh_token || ''

    if (accessToken === '' || refreshToken === '') { //check if cookies are set before passing them to function component
        console.log("no cookies set")
        return {
            redirect: {
                destination: '/login', //if not, redirect back to /login
                permanent: false,
            }
        }
    }

    return {
        props: {cookies},
    }
}

export default function CustomersPage(props) {
    const [customers, setCustomers] = useState('')

    async function handleClick() {
        //GET all customers request
        const request = {
            method: "GET",
            headers: { "Authorization": "Bearer " + props.cookies.access_token }
        };

        try {
            const response = await fetch("http://localhost:8080/customers", request)

            if (!response.ok) {
                console.log("HTTP error: " + response.statusText)
                throw new Error("HTTP error: " + response.statusText)
            }

            const data = await response.json()

            const customersComponents = data.map((cus) =>
                <div>
                    <ul>
                        <li key={cus["full_name"].toString()+"CN"}>Customer Name: {cus["full_name"]}</li>
                        <li key={cus["full_name"].toString()+"ID"}>ID: {cus["customer_id"]}</li>
                        <li key={cus["full_name"].toString()+"DOB"}>DOB: {cus["date_of_birth"]}</li>
                        <li key={cus["full_name"].toString()+"CITY"}>City: {cus["city"]}</li>
                        <li key={cus["full_name"].toString()+"ZIP"}>Zip Code: {cus["zipcode"]}</li>
                        <li key={cus["full_name"].toString()+"STATUS"}>Customer Status: {cus["status"]}</li>
                    </ul>
                </div>
            )

            setCustomers(customersComponents)

        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div>
            <Head>
                <title>Banking App - All customers</title>
                <link rel="icon" type="image/png" href="/favicon-16x16.png" />
            </Head>

            <div>
                <Header title="All Customers"/>

                <div>
                    <button type="button" onClick={handleClick}>Load data</button>
                    <div>{customers}</div>
                </div>
            </div>
        </div>
    )
}
