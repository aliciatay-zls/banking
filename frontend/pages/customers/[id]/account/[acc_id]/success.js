import Head from "next/head";
import Link from "next/link";

import serverSideProps from "../../../api/serverSideProps"
import Header from "../../../../../components/header";

export async function getServerSideProps(context) {
    await serverSideProps(context);

    const customerID = context.params.id;
    const accountID = context.params.acc_id;
    const beforeURL = `http://localhost:3000/customers/${customerID}/account/${accountID}`;
    const transactionType = context.query.transactionType || '';
    const transactionID = context.query.transactionID || '';
    const newBalance = context.query.newBalance || '';

    if (transactionType === '' || transactionID === '' || newBalance === '') { //HERE
        console.log("Missing query params in url. Redirecting to transaction page.");
        return {
            redirect: {
                destination: beforeURL,
                permanent: true,
            },
        };
    }

    return {
        props: {
            beforeURL: beforeURL,
            transactionType: transactionType,
            transactionID: transactionID,
            newBalance: newBalance,
        },
    };
}

export default function TransactionSuccessPage(props) {
    return (
        <div>
            <Head>
                <title>Banking App - Success</title>
                <link rel="icon" type="image/png" href="/favicon-16x16.png" />
            </Head>

            <div>
                <Header title={`Your ${props.transactionType} was successful.`}></Header>
                <ul>
                    <li>New account balance: {props.newBalance}</li>
                    <li>Transaction ID: {props.transactionID}</li>
                </ul>
            </div>

            <Link href={props.beforeURL}>
                <button type="button">Make another transaction</button>
            </Link>
        </div>
    );
}
