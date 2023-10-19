import Head from 'next/head';
import Link from "next/link";
import { Fragment } from "react";

import getServerSideProps from "./api/serverSideProps";
import Header from "../../components/header";

export { getServerSideProps };

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
