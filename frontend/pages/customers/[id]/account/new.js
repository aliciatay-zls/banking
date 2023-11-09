import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import Box from '@mui/material/Box';
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import DefaultLayout from "../../../../components/defaultLayout";
import authServerSideProps from "../../../../src/authServerSideProps";
import getHomepagePath from "../../../../src/getHomepagePath";
import handleFetchResource from "../../../../src/handleFetchResource";

export async function getServerSideProps(context) {
    const initProps = await authServerSideProps(context);
    if (!initProps.props) {
        return initProps;
    }

    const clientRole = initProps.props.clientInfo?.role || '';
    if (clientRole !== 'admin') {
        return {
            redirect: {
                destination: getHomepagePath(initProps.props.clientInfo) || '/login',
                permanent: false,
            }
        }
    }

    return {
        props: {
            customerId: context.params.id,
            accessToken: initProps.props.accessToken,
            clientInfo: initProps.props.clientInfo,
            currentPath: initProps.props.currentPath,
            requestURL: initProps.props.requestURL,
        }
    };
}

export default function CreateAccountPage(props) {
    const router = useRouter();

    const [selectedType, setSelectedType] = useState('');
    const [inputAmount, setInputAmount] = useState(0);
    const [errorAmount, setErrorAmount] = useState(false);
    const [newAccountInfo, setNewAccountInfo] = useState('');
    const [error, setError] = useState('');
    const [openConfirmation, setOpenConfirmation] = useState(false);

    const buttonLinkAccounts = `http://localhost:3000/customers/${props.customerId}/account`;
    const buttonLinkAllCustomers = "http://localhost:3000/customers";

    function checkInputAmount(rawAmt) {
        const re = new RegExp("^[0-9]+$");
        if (re.test(rawAmt)) {
            const amt = parseInt(rawAmt, 10);
            if (!isNaN(amt) && amt >= 5000) {
                setErrorAmount(false);
                setInputAmount(amt);
                return;
            }
        }
        setInputAmount(0);
        setErrorAmount(true);
    }

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
            clientInfo={props.clientInfo}
            tabTitle={"Create Account"}
            headerTitle={`Creating account for: Customer ${props.customerId}`}
            importantMsg={"Please note that the minimum amount to create an account is $5,000."}
        >
            <Box
                component="form"
                name="create-account-form"
                autoComplete="off"
                sx={{
                    '& .MuiTextField-root': { m: 1, width: '25ch' },
                }}
                onSubmit={handleGetConfirmation}
            >
                <div>
                    <TextField
                        required
                        select
                        id="select-account-type"
                        label="Account Type"
                        value={selectedType}
                        onChange={e => setSelectedType(e.target.value)}
                    >
                        <MenuItem value={"saving"}>Saving</MenuItem>
                        <MenuItem value={"checking"}>Checking</MenuItem>
                    </TextField>
                </div>

                <div>
                    <TextField
                        required
                        inputMode="numeric"
                        id="account-amount"
                        label="Initial Amount"
                        error={errorAmount === true}
                        helperText={errorAmount ? "Please enter a valid amount." : ""}
                        onChange={e => checkInputAmount(e.target.value)}
                    />
                </div>

                <div>
                    <Button type="submit" variant="contained">Create</Button>
                </div>
            </Box>

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