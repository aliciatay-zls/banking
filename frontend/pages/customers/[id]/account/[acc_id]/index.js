import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

import handler from "../../../api/handler";
import serverSideProps from "../../../api/serverSideProps";
import Header from "../../../../../components/header";

export async function getServerSideProps(context) {
    try {
        const initProps = await serverSideProps(context);

        return {
            props: {
                initProps: initProps.props,
            },
        };
    } catch(err) {
        console.log(err);
    }
}

export default function TransactionPage(props) {
    const router = useRouter();
    const [selectedAmount, setSelectedAmount] = useState(0);
    const [selectedType, setSelectedType] = useState('none');
    const [error, setError] = useState('');

    const accessToken = props.initProps.accessToken;
    const currentPath = props.initProps.currentPathName;
    const requestURL = props.initProps.requestURL;

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
        const result = finalProps.props.responseData || '';

        if (result !== '') {
            const successURL = currentPath.concat("/success", "?",
                `transactionType=${encodeURIComponent(selectedType)}`, "&",
                `transactionID=${encodeURIComponent(result.transaction_id)}`, "&",
                `newBalance=${encodeURIComponent(result.new_balance)}`);

            return router.replace(successURL);
        }
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