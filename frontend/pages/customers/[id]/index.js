import Head from 'next/head';
import Link from 'next/link';

import handler from "../api/handler";
import serverSideProps from "../api/serverSideProps";
import Header from "../../../components/header";

export async function getServerSideProps(context) {
    try {
        const initProps = await serverSideProps(context);

        const request = {
            method: "GET",
            headers: { "Authorization": "Bearer " + initProps.props.accessToken },
        };

        return await handler(initProps.props.currentPathName, initProps.props.requestURL, request);
    } catch(err) {
        console.log(err);
    }
}

export default function CustomerHomePage(props) {
    const buttonLink = props.currentPathName.concat("/", "account");

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
                        <p>Name: {props.responseData["full_name"]}</p>
                        <ul>
                            <li>Date of Birth: {props.responseData["date_of_birth"]}</li>
                            <li>City: {props.responseData["city"]}</li>
                            <li>Zip Code: {props.responseData["zipcode"]}</li>
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
