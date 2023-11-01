import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";

import { DataToDisplayContext } from "../../../../_app";
import { LogoutAppBar } from "../../../../../components/appbar";
import Header from "../../../../../components/header";
import serverSideProps from "../../../../../src/serverSideProps"

export async function getServerSideProps(context) {
    const initProps = await serverSideProps(context); //just to check cookies are set
    if (!initProps.props) {
        return initProps;
    }

    const customerID = context.params?.id || '';
    const accountID = context.params?.acc_id || '';
    const beforeURL = `http://localhost:3000/customers/${customerID}/account/${accountID}`;

    return {
        props: {
            beforeURL: beforeURL,
        },
    };
}

export default function TransactionSuccessPage(props) {
    const router = useRouter();
    const { dataToDisplay } = useContext(DataToDisplayContext);
    const [shouldRedirectBack, setShouldRedirectBack] = useState(false);

    useEffect(() => {
        if (shouldRedirectBack) {
            console.log("Missing information on transaction result. Redirecting back to transaction page.");
            router.replace(props.beforeURL);
        }
    }, [shouldRedirectBack]);


    if (!dataToDisplay || dataToDisplay.length < 2) {
        if (!shouldRedirectBack) {
            setShouldRedirectBack(true);
        }
    }

    const transactionID = dataToDisplay[0]?.transaction_id || '';
    const newBalance = dataToDisplay[0]?.new_balance || '';
    const transactionType = dataToDisplay[1] || '';

    return (
        <div>
            <Head>
                <title>Banking App - Success</title>
                <link rel="icon" type="image/png" href="/favicon-16x16.png" />
            </Head>

            <LogoutAppBar/>

            <div>
                <Header title={`Your ${transactionType} was successful.`}></Header>
                <ul>
                    <li>New account balance: {newBalance}</li>
                    <li>Transaction ID: {transactionID}</li>
                </ul>
            </div>

            <Link href={props.beforeURL}>
                <button type="button">Make another transaction</button>
            </Link>
        </div>
    );
}
