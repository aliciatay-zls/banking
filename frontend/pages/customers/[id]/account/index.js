import Link from "next/link";
import { Fragment } from "react";

import DefaultLayout from "../../../../components/defaultLayout";
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

    const finalProps = await handleFetchResource(initProps.props.currentPath, initProps.props.requestURL, request);
    if (!finalProps.props) {
        return finalProps;
    }

    return {
        props: {
            clientInfo: initProps.props.clientInfo,
            responseData: finalProps.props.responseData,
            currentPath: finalProps.props.currentPath,
        }
    }
}

export default function AccountsPage(props) {
    return (
        <DefaultLayout
            clientInfo={props.clientInfo}
            tabTitle={"My Accounts"}
            headerTitle={"My Accounts"}
        >
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
        </DefaultLayout>
    );
}
