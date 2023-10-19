import Head from "next/head";
import { useState } from "react";
import { parse } from "cookie";

import Header from "../../../../components/header";

export function getServerSideProps(context) {
    //get cookies
    const { req } = context;
    const rawCookies = req.headers.cookie || '';
    const cookies = parse(rawCookies);
    const accessToken = cookies.access_token || '';
    const refreshToken = cookies.refresh_token || '';
    const clientSideDefaultErrorMessage = "Unexpected error occurred";

    if (accessToken === '' || refreshToken === '') {
        console.log("no cookies set");
        return {
            redirect: {
                destination: `/login?errorMessage=${encodeURIComponent(clientSideDefaultErrorMessage)}`,
                permanent: false,
            }
        }
    }

    return {
        props: {currentPath: context.resolvedUrl, accessToken: accessToken},
    };
}

export default function TransactionPage(props) {
    const [selectedAmount, setSelectedAmount] = useState(0);
    const [selectedType, setSelectedType] = useState('none');
    const [result, setResult] = useState('');
    const [error, setError] = useState('');

    async function handleMakeTransaction(event) {
        event.preventDefault();

        if (selectedType === 'none') {
            setError("No transaction type was selected.");
            return;
        }

        const requestURL = "http://127.0.0.1:8080".concat(props.currentPath);
        const request = {
            method: "POST",
            headers: { "Authorization": "Bearer " + props.accessToken },
            body: JSON.stringify({amount: selectedAmount, transaction_type: selectedType}),
        };

        let data = '';
        try {
            const response = await fetch(requestURL, request);
            data = await response.json();
            if (!response.ok) {
                throw new Error("HTTP error: " + data.message);
            }

            setResult(data);
        } catch (err) {
            console.log(err);
            setError(err.message);
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

            { result && !error && <div>
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