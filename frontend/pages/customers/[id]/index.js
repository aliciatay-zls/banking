import Head from 'next/head';
import Link from 'next/link';

import Header from "../../../components/header";
import getServerSideProps from "../api/serverSideProps";

export { getServerSideProps };

export default function CustomerHomePage(props) {
    const buttonLink = props.currentPath.concat("/", "account");

    return (
        <div>
            <Head>
                <title>Banking App - Home</title>
                <link rel="icon" type="image/png" href="/favicon-16x16.png" />
            </Head>

            <div>
                <div>
                    <Header title="My Profile"/>
                    <div>
                        <p>Name: {props.customers["full_name"]}</p>
                        <ul>
                            <li>Date of Birth: {props.customers["date_of_birth"]}</li>
                            <li>City: {props.customers["city"]}</li>
                            <li>Zip Code: {props.customers["zipcode"]}</li>
                        </ul>
                    </div>
                </div>

                <div>
                    <Link href={buttonLink}>
                        <button type="button">
                            View my accounts
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
