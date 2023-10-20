import Head from "next/head";
import { useState } from "react";

import handler from "../../api/handler";
import serverSideProps from "../../api/serverSideProps";
import Header from "../../../../components/header";

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
    const [selectedAmount, setSelectedAmount] = useState(0);
    const [selectedType, setSelectedType] = useState('none');
    const [result, setResult] = useState('');
    const [error, setError] = useState('');

    async function handleMakeTransaction(event) {
        event.preventDefault();
        setError('');

        if (selectedType === 'none') {
            setError("No transaction type was selected.");
            return;
        }

        const request = {
            method: "POST",
            headers: { "Authorization": "Bearer " + props.initProps.accessToken },
            body: JSON.stringify({amount: selectedAmount, transaction_type: selectedType}),
        };

        const finalProps = await handler(props.initProps.currentPathName, props.initProps.requestURL, request);

        setResult(finalProps.props.responseData);
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

            { result !== '' && !error && <div>
                <p>Transaction success.</p>
                <ul>
                    <li>Transaction ID: {result.transaction_id}</li>
                    <li>New balance: {result.new_balance}</li>
                </ul>
            </div>}

            { error && <div style={{ color: 'red'}}>
                <p>Transaction failed.</p>
                <p>{error}</p>
            </div> }
        </div>
    );
}