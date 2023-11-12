import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import Box from '@mui/material/Box';
import Button from "@mui/material/Button";
import Container from '@mui/material/Container';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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
    const [error, setError] = useState('');
    const [openConfirmation, setOpenConfirmation] = useState(false);
    const [newAccountInfo, setNewAccountInfo] = useState('');

    const buttonLinkAccounts = `http://localhost:3000/customers/${props.customerId}/account`;

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
            tabTitle={"Account Opening"}
        >
            <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
                <Paper
                    variant="outlined"
                    sx={{
                       my: { xs: 2, md: 2 },
                       p: { xs: 2, md: 5 },
                       minHeight: "400px",
                       alignContent: "center",
                       display: "grid",
                    }}
                >
                    { !newAccountInfo ? (
                        <Box
                            component="form"
                            name="create-account-form"
                            autoComplete="off"
                            onSubmit={handleGetConfirmation}
                        >
                            <Typography variant="h4" align="center" fontWeight="600" marginBottom={1}>
                                Account Opening
                            </Typography>
                            <Typography variant="subtitle1" align="center" gutterBottom style={{ color: 'blue', lineHeight: 1.2, marginBottom: 20,}}>
                                Note: minimum initial amount to open an account is $5,000.
                            </Typography>

                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        disabled
                                        id="display-customer-id"
                                        label="Customer ID"
                                        fullWidth
                                        variant="standard"
                                        value={props.customerId}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        select
                                        id="select-account-type"
                                        label="Account Type"
                                        fullWidth
                                        variant="standard"
                                        value={selectedType}
                                        onChange={e => setSelectedType(e.target.value)}
                                    >
                                        <MenuItem value={"saving"}>Saving</MenuItem>
                                        <MenuItem value={"checking"}>Checking</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        inputMode="numeric"
                                        id="input-account-amount"
                                        label="Initial Amount"
                                        fullWidth
                                        variant="standard"
                                        error={errorAmount === true}
                                        helperText={errorAmount ? "Please enter a valid amount." : ""}
                                        onChange={e => checkInputAmount(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} />
                                <ButtonLinkToAllCustomers />
                                <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button type="submit" variant="contained">
                                        Submit
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    ) : (
                        <Grid container spacing={3} name="create-account-success-info">
                            <Grid item xs={12}>
                                <Typography variant="h5" align="center" style={{color: 'green', marginTop: 20}}>
                                    <CheckCircleIcon fontSize="small"/> Success.
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" align="center">
                                    New account number: {newAccountInfo}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} />
                            <ButtonLinkToAllCustomers />
                            <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Link href={buttonLinkAccounts}>
                                    <Button type="button" variant="no-caps" size="small" endIcon={<ArrowForwardIosIcon/>}>
                                        Go to accounts
                                    </Button>
                                </Link>
                            </Grid>
                        </Grid>
                    )}
                </Paper>
            </Container>

            <Dialog
                open={openConfirmation}
                onClose={handleCancel}
            >
                <DialogTitle>
                    {`Open ${selectedType} account of $${inputAmount}?`}
                </DialogTitle>
                <DialogActions>
                    <Button onClick={handleCancel}>No</Button>
                    <Button onClick={handleNewAccount}>Yes</Button>
                </DialogActions>
            </Dialog>

            { error &&
                <div style={{ color: 'red'}}>
                    <p>Failed to create account.</p>
                    <p>{error}</p>
                </div>
            }
        </DefaultLayout>
    );
}

function ButtonLinkToAllCustomers() {
    const buttonLinkAllCustomers = "http://localhost:3000/customers";

    return (
        <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Link href={buttonLinkAllCustomers}>
                <Button type="button" variant="no-caps" size="small" startIcon={<ArrowBackIosIcon/>}>
                    Back to customers
                </Button>
            </Link>
        </Grid>
    );
}
