import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";

import { DataToDisplayContext } from "../../../../_app";
import DefaultLayout from "../../../../../components/defaultLayout";
import authServerSideProps from "../../../../../src/authServerSideProps"

export async function getServerSideProps(context) {
    const initProps = await authServerSideProps(context);
    if (!initProps.props) {
        return initProps;
    }

    const customerID = context.params?.id || '';
    const accountID = context.params?.acc_id || '';
    const beforeURL = `http://localhost:3000/customers/${customerID}/account/${accountID}`;

    return {
        props: {
            clientInfo: initProps.props.clientInfo,
            beforeURL: beforeURL,
        },
    };
}

export default function TransactionSuccessPage(props) {
    const router = useRouter();
    const { dataToDisplay } = useContext(DataToDisplayContext);
    const pageData = dataToDisplay?.pageData || [];
    const [shouldRedirectBack, setShouldRedirectBack] = useState(false);

    useEffect(() => {
        if (shouldRedirectBack) {
            console.log("Missing information on transaction result. Redirecting back to transaction page.");
            router.replace(props.beforeURL);
        }
    }, [shouldRedirectBack]);

    if (pageData.length < 2 && !dataToDisplay.isLoggingOut) {
        if (!shouldRedirectBack) {
            setShouldRedirectBack(true);
        }
    }

    const transactionID = pageData[0]?.transaction_id || '';
    const newBalance = pageData[0]?.new_balance || '';
    const transactionType = pageData[1] || '';
    const headerTitle = transactionType !== '' ? `Your ${transactionType} was successful.` : '';

    return (
        <DefaultLayout
            clientInfo={props.clientInfo}
            tabTitle={"Success"}
            headerTitle={headerTitle}
        >
            { transactionID !== '' && newBalance !== '' &&
                <div>
                    <ul>
                        <li>New account balance: {newBalance}</li>
                        <li>Transaction ID: {transactionID}</li>
                    </ul>

                    <Link href={props.beforeURL}>
                        <button type="button">Make another transaction</button>
                    </Link>
                </div>
            }
        </DefaultLayout>
    );
}
