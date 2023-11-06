import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";

import DefaultLayout from "../../../../components/defaultLayout";
import handleFetchResource from "../../../../src/handleFetchResource";
import serverSideProps from "../../../../src/serverSideProps";

export async function getServerSideProps(context) {
    const initProps = await serverSideProps(context);
    if (!initProps.props) {
        return initProps;
    }

    return {
        props: {
            customerId: context.params.id,
            accessToken: initProps.props.accessToken,
            currentPath: initProps.props.currentPath,
            requestURL: initProps.props.requestURL,
        }
    };
}

export default function CreateAccountPage(props) {
    const router = useRouter();

    const [selectedType, setSelectedType] = useState('');
    const [inputAmount, setInputAmount] = useState(0);
    const [newAccountInfo, setNewAccountInfo] = useState('');
    const [error, setError] = useState('');
    const [openConfirmation, setOpenConfirmation] = useState(false);

    const buttonLinkAccounts = `http://localhost:3000/customers/${props.customerId}/account`;
    const buttonLinkAllCustomers = "http://localhost:3000/customers";

    function handleGetConfirmation(event) {
        event.preventDefault();
        setError('');

        const isValid = event.target.checkValidity();
        if (!isValid) {
            setError("Please check that all fields have been correctly filled up.");
        } else {
            setOpenConfirmation(true);
        }
    }

    async function handleNewAccount() {
        setOpenConfirmation(false);

        const request = {
            method: "POST",
            headers: { "Authorization": "Bearer " + props.accessToken },
            body: JSON.stringify({account_type: selectedType, amount: inputAmount})
        };

        const finalProps = await handleFetchResource(props.currentPath, props.requestURL, request);
        const responseData = finalProps?.props?.responseData || '';

        if (responseData === '') {
            const possibleRedirect = finalProps?.redirect?.destination || '';
            if (possibleRedirect === '') {
                console.log("No response after sending new account request");
                setError("Something went wrong on our end, please try again later.");
            } else {
                setError(finalProps.redirect.errorMessage);
                setTimeout(() => router.replace(possibleRedirect), 3000);
            }
            return;
        }

        setNewAccountInfo(responseData.account_id);
    }

    function handleCancel() {
        setOpenConfirmation(false);
    }

    return (
        <DefaultLayout
            tabTitle={"Create Account"}
            headerTitle={`Creating account for: Customer ${props.customerId}`}
            importantMsg={"Please note that the minimum amount to create an account is $5,000."}
        >
            <form name={"create-account-form"} onSubmit={handleGetConfirmation}>
                <div>
                    <label htmlFor="select-account-type">Account type: </label>
                    <select
                        id="select-account-type"
                        value={selectedType}
                        required
                        onChange={e => setSelectedType(e.target.value)}
                    >
                        <option value="">Please select an option</option>
                        <option value="saving">Saving</option>
                        <option value="checking">Checking</option>
                    </select>
                </div>
                <div>
                    <label htmlFor={"account-amount"}>Initial amount: </label>
                    <input
                        type="number"
                        id="account-amount"
                        name="account-amount"
                        min="5000"
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
                            {`Create a ${selectedType} account with an initial amount of $${inputAmount}?`}
                        </DialogTitle>
                        <DialogActions>
                            <Button onClick={handleCancel}>No</Button>
                            <Button onClick={handleNewAccount}>Yes</Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </form>

            <div>
                <Link href={buttonLinkAccounts}>
                    <button type="button">Go to accounts</button>
                </Link>
            </div>

            <div>
                <Link href={buttonLinkAllCustomers}>
                    <button type="button">Back to all customers</button>
                </Link>
            </div>

            { newAccountInfo &&
                <div>
                    <p>Account successfully created </p>
                    <p>New Account No.: {newAccountInfo}</p>
                </div>
            }

            { error &&
                <div style={{ color: 'red'}}>
                    <p>Failed to create account.</p>
                    <p>{error}</p>
                </div>
            }
        </DefaultLayout>
    );
}