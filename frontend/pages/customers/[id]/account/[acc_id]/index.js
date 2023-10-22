import Head from "next/head";
import { useRouter } from "next/router";
import { useContext, useState } from "react";

import { DataToDisplayContext } from "../../../../_app";
import handler from "../../../api/handler";
import serverSideProps from "../../../api/serverSideProps";
import Header from "../../../../../components/header";

export async function getServerSideProps(context) {
    return await serverSideProps(context);
}

export default function TransactionPage(props) {
    const router = useRouter();
    const { setDataToDisplay } = useContext(DataToDisplayContext);
    const [selectedAmount, setSelectedAmount] = useState(0);
    const [selectedType, setSelectedType] = useState('none');
    const [error, setError] = useState('');

    const accessToken = props.accessToken;
    const currentPath = props.currentPath;
    const requestURL = props.requestURL;

    async function handleMakeTransaction(event) {
        event.preventDefault();
        setError('');

        if (selectedType === 'none') {
            setError("No transaction type was selected.");
            return;
        }

        const request = {
            method: "POST",
            headers: { "Authorization": "Bearer " + accessToken },
            body: JSON.stringify({amount: selectedAmount, transaction_type: selectedType}),
        };

        const finalProps = await handler(currentPath, requestURL, request);
        const result = finalProps?.props?.responseData ? [finalProps.props.responseData] : [];

        if (result.length === 0) {
            console.log("No response after sending transaction request");
            setError("Something went wrong on our end, please try again later.");
            return;
        }

        result.push(selectedType);
        setDataToDisplay(result);

        return router.replace(currentPath.concat("/success"));
    }

    return (
        <div>
            <Head>
                <title>Banking App - New Transaction</title>
                <link rel="icon" type="image/png" href="/favicon-16x16.png" />
            </Head>

            <div>
                <Header title="What would you like to do today?"></Header>
                <form name="transaction-form" onSubmit={handleMakeTransaction}>
                    <p>Make a &nbsp;
                        <select
                            name="transaction-type"
                            value={selectedType}
                            onChange={e => setSelectedType(e.target.value)}
                        >
                            <option value="none">Please select an option</option>
                            <option value="deposit">deposit</option>
                            <option value="withdrawal">withdrawal</option>
                        </select>
                    </p>

                    <label htmlFor="transaction-amount">Amount: </label>
                    <input
                        id="transaction-amount"
                        name="transaction-amount"
                        type="text"
                        required={true}
                        onChange={e => setSelectedAmount(parseInt(e.target.value, 10))}
                    />

                    <button type="submit">Submit</button>
                </form>
            </div>

            { error &&
                <div style={{ color: 'red'}}>
                    <p>Transaction failed.</p>
                    <p>{error}</p>
                </div>
            }
        </div>
    );
}