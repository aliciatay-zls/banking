import { useRouter } from "next/router";
import { useContext, useState } from "react";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';

import { DataToDisplayContext } from "../../../../_app";
import DefaultLayout from "../../../../../components/defaultLayout";
import authServerSideProps from "../../../../../src/authServerSideProps";
import handleFetchResource from "../../../../../src/handleFetchResource";

export async function getServerSideProps(context) {
    return await authServerSideProps(context);
}

export default function TransactionPage(props) {
    const router = useRouter();

    const { setDataToDisplay } = useContext(DataToDisplayContext);
    const [selectedType, setSelectedType] = useState('');
    const [inputAmount, setInputAmount] = useState(0);
    const [error, setError] = useState('');
    const [openConfirmation, setOpenConfirmation] = useState(false);

    const accessToken = props.accessToken;
    const currentPath = props.currentPath;
    const requestURL = props.requestURL;

    function handleGetConfirmation(event) {
        event.preventDefault();
        setError('');
        setDataToDisplay({
            isLoggingOut: false,
            pageData: [],
        }); //clear any previous data

        const isValid = event.target.checkValidity();
        if (!isValid) {
            setError("Please check that all fields have been correctly filled up.");
        } else {
            setOpenConfirmation(true);
        }
    }

    async function handleMakeTransaction() {
        setOpenConfirmation(false);

        const request = {
            method: "POST",
            headers: { "Authorization": "Bearer " + accessToken },
            body: JSON.stringify({transaction_type: selectedType, amount: inputAmount}),
        };

        const finalProps = await handleFetchResource(currentPath, requestURL, request);
        const responseData = finalProps?.props?.responseData ? [finalProps.props.responseData] : [];

        if (responseData.length === 0) {
            const possibleRedirect = finalProps?.redirect?.destination || '';
            if (possibleRedirect === '') {
                console.log("No response after sending transaction request");
                setError("Something went wrong on our end, please try again later.");
            } else {
                setError(finalProps.redirect.errorMessage);
                setTimeout(() => router.replace(possibleRedirect), 10000);
            }
            return;
        }

        responseData.push(selectedType);
        setDataToDisplay({
            isLoggingOut: false,
            pageData: responseData,
        });

        return router.replace(`${currentPath}/success`);
    }

    function handleCancel() {
        setOpenConfirmation(false);
    }

    return (
        <DefaultLayout
            clientInfo={props.clientInfo}
            tabTitle={"New Transaction"}
            headerTitle={"What would you like to do today?"}
            importantMsg={"Please note that only amounts between $1 to $100,000 are allowed."}
        >
            <form name="transaction-form" onSubmit={handleGetConfirmation}>
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
                        type="number"
                        id="transaction-amount"
                        name="transaction-amount"
                        min="1"
                        max="100000"
                        required
                        onChange={e => setInputAmount(parseInt(e.target.value, 10))}
                    />
                </div>

                <div>
                    <Button type="submit" variant="contained">Submit</Button>
                    <Dialog
                        open={openConfirmation}
                        onClose={handleCancel}
                    >
                        <DialogTitle>
                            {`Are you sure you want to make a ${selectedType} of $${inputAmount}?`}
                        </DialogTitle>
                        <DialogActions>
                            <Button onClick={handleCancel}>No</Button>
                            <Button onClick={handleMakeTransaction}>Yes</Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </form>

            { error &&
                <div style={{ color: 'red'}}>
                    <p>Transaction failed.</p>
                    <p>{error}</p>
                </div>
            }
        </DefaultLayout>
    );
}