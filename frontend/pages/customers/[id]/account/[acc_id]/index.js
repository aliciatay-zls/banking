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
    const [selectedType, setSelectedType] = useState('');
    const [inputAmount, setInputAmount] = useState(0);
    const [error, setError] = useState('');

    const accessToken = props.accessToken;
    const currentPath = props.currentPath;
    const requestURL = props.requestURL;

    async function handleMakeTransaction(event) {
        event.preventDefault();
        setError('');

        const request = {
            method: "POST",
            headers: { "Authorization": "Bearer " + accessToken },
            body: JSON.stringify({transaction_type: selectedType, amount: inputAmount}),
        };

        const finalProps = await handler(currentPath, requestURL, request);
        const responseData = finalProps?.props?.responseData ? [finalProps.props.responseData] : [];

        if (responseData.length === 0) {
            const possibleRedirect = finalProps?.redirect?.destination || '';
            if (possibleRedirect === '') {
                console.log("No response after sending transaction request");
                setError("Something went wrong on our end, please try again later.");
            } else {
                setError(finalProps.redirect.errorMessage);
                setTimeout(() => router.replace(possibleRedirect), 3000);
            }
            return;
        }

        responseData.push(selectedType);
        setDataToDisplay(responseData);

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
                    <div>
                        <label htmlFor="select-transaction-type">Make a </label>
                        <select
                            id="select-transaction-type"
                            name="transaction-type"
                            value={selectedType}
                            required
                            onChange={e => setSelectedType(e.target.value)}
                        >
                            <option value="">Please select an option</option>
                            <option value="deposit">deposit</option>
                            <option value="withdrawal">withdrawal</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="transaction-amount">Amount: </label>
                        <input
                            id="transaction-amount"
                            name="transaction-amount"
                            type="text"
                            required
                            onChange={e => setInputAmount(parseInt(e.target.value, 10))}
                        />
                    </div>

                    <div>
                        <button type="submit">Submit</button>
                    </div>
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