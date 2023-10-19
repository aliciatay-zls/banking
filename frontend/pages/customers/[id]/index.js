import Head from 'next/head';
import Link from 'next/link';

import Header from "../../../components/header";
import getServerSideProps from "../api/serverSideProps";

export { getServerSideProps };

export default function CustomerHomePage(props) {
    console.log("LANDED ON [ID] PAGE");
    const accountId = "95470";
    const buttonLink = props.currentPath.concat("/account", "/", accountId);
    console.log(props.currentPath);
    console.log(props.currentPath.concat("/account", "/", accountId));


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
                    <Header title="My Accounts"/>
                    <div>
                        <select name="account-number" id="account-number">
                            <option value="95470"></option>
                        </select>
                        <Link href={buttonLink}>
                            <button type="button">
                                Make a Transaction
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
