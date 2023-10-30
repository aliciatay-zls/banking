import Head from 'next/head';
import Link from "next/link";
import { Fragment } from "react";

import Header from "../../../../components/header";
import handleFetchResource from "../../../../src/handleFetchResource";
import serverSideProps from "../../../../src/serverSideProps";

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
                    {props.responseData && props.responseData.map( (acc) => {
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
