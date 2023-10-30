import Head from 'next/head';
import Link from "next/link";
import { Fragment } from "react";

import Header from "../../components/header";
import handleFetchResource from "../../src/handleFetchResource";
import serverSideProps from "../../src/serverSideProps";

export async function getServerSideProps(context) {
    try {
        const initProps = await serverSideProps(context);
        if (!initProps.props) {
            return initProps;
        }

        const request = {
            method: "GET",
            headers: { "Authorization": "Bearer " + initProps.props.accessToken },
        };

        return await handleFetchResource(initProps.props.currentPath, initProps.props.requestURL, request);
    } catch(err) {
        console.log(err);
    }
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
                    { props.responseData && props.responseData.map((cus) => {
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
                                <div>
                                    <Link href={"/customers".concat("/", customerId)}>
                                        <button type="button">
                                            Transact on behalf
                                        </button>
                                    </Link>
                                </div>
                                <div>
                                    <Link href={"/customers".concat(`/${customerId}/account/new`)}>
                                        <button type="button">
                                            Create new account
                                        </button>
                                    </Link>
                                </div>
                            </Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
