import Head from 'next/head';

import Header from "../../components/header";
import { getServerSideProps } from "./index.js";

export { getServerSideProps };

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
                        <p>Full Name: {props.customers["full_name"]}</p>
                        <ul>
                            <li>Date of Birth: {props.customers["date_of_birth"]}</li>
                            <li>City: {props.customers["city"]}</li>
                            <li>Zip Code: {props.customers["zipcode"]}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
