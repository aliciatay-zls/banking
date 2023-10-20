import Head from 'next/head';
import Link from "next/link";
import { Fragment } from "react";

import handler from "../../api/handler";
import serverSideProps from "../../api/serverSideProps";
import Header from "../../../../components/header";

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
                                <Link href={props.currentPathName.concat("/", accountId)}>
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
