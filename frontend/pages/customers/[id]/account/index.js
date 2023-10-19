import Head from 'next/head';
import Link from "next/link";
import { Fragment } from "react";
import { parse } from "cookie";

import Header from "../../../../components/header";

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
        }
    }

    const currentPathName = context.resolvedUrl;
    const requestURL = "http://127.0.0.1:8080".concat(currentPathName);
    const request = {
        method: "GET",
        headers: { "Authorization": "Bearer " + accessToken },
    };
    let data = '';
    try {
        const response = await fetch(requestURL, request);
        data = await response.json();
        if (!response.ok) {
            throw new Error("HTTP error: " + data.message);
        }
    } catch (err) {
        console.log(err);
    }

    return {
        props: {accounts: data, currentPath: currentPathName},
    };
}

export default function AccountsPage(props) {
    return (
        <div>
            <Head>
                <title>Banking App - My Accounts</title>
                <link rel="icon" type="image/png" href="/favicon-16x16.png" />
            </Head>

            <div>
                <Header title="My Accounts"/>
                <div>
                    {props.accounts && props.accounts.map( (acc) => {
                        const accountId = acc["account_id"];
                        const accountType = acc["account_type"];
                        const accountAmount = acc["amount"];

                        return (
                            <Fragment key={accountId}>
                                <ul>
                                    <li>Account No.: {accountId}</li>
                                    <li>Type: {accountType}</li>
                                    <li>Balance: ${accountAmount}</li>
                                </ul>
                                <Link href={props.currentPath.concat("/", accountId)}>
                                    <button type="button">
                                        Make a transaction
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
