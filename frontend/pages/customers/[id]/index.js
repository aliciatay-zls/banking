import Head from 'next/head';
import Link from 'next/link';

import { LogoutAppBar } from "../../../components/appbar";
import Header from "../../../components/header";
import handleFetchResource from "../../../src/handleFetchResource";
import serverSideProps from "../../../src/serverSideProps";

export async function getServerSideProps(context) {
    const initProps = await serverSideProps(context);
    if (!initProps.props) {
        return initProps;
    }

    const request = {
        method: "GET",
        headers: { "Authorization": "Bearer " + initProps.props.accessToken },
    };

    return await handleFetchResource(initProps.props.currentPath, initProps.props.requestURL, request);
}

export default function CustomerHomePage(props) {
    const buttonLink = props?.currentPath?.concat("/account") || '';

    return (
        <div>
            <Head>
                <title>Banking App - Home</title>
                <link rel="icon" type="image/png" href="/favicon-16x16.png" />
            </Head>

            <LogoutAppBar/>

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
                        <button type="button">View my accounts</button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
