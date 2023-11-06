import Link from "next/link";
import { Fragment } from "react";

import DefaultLayout from "../../components/defaultLayout";
import handleFetchResource from "../../src/handleFetchResource";
import serverSideProps from "../../src/serverSideProps";

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
            clientRole: initProps.props.clientRole,
            responseData: finalProps.props.responseData,
            currentPath: finalProps.props.currentPath,
        }
    }
}

export default function CustomersPage(props) {
    return (
        <DefaultLayout
            clientRole={props.clientRole}
            tabTitle={"Home"}
            headerTitle={"All Customers"}
        >
            <div>
                { props.responseData && props.responseData.map((cus) => {
                    const customerId = cus["customer_id"].toString();
                    const customerName = cus["full_name"];
                    const customerDOB = cus["date_of_birth"];
                    const customerCity = cus["city"];
                    const customerZip = cus["zipcode"];
                    const customerStatus = cus["status"];

                    return (
                        <Fragment key={customerId}>
                            <p>Customer Name: {customerName}</p>
                            <ul>
                                <li>ID: {customerId}</li>
                                <li>DOB: {customerDOB}</li>
                                <li>City: {customerCity}</li>
                                <li>Zip Code: {customerZip}</li>
                                <li>Customer Status: {customerStatus}</li>
                            </ul>
                            <div>
                                <Link href={"/customers".concat(`/${customerId}/account`)}>
                                    <button type="button">
                                        Transact on behalf
                                    </button>
                                </Link>
                            </div>
                            <div>
                                <Link href={"/customers".concat(`/${customerId}/account/new`)}>
                                    <button type="button">
                                        Create new account
                                    </button>
                                </Link>
                            </div>
                        </Fragment>
                    );
                })}
            </div>
        </DefaultLayout>
    );
}
