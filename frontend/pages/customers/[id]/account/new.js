import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import Box from '@mui/material/Box';
import Button from "@mui/material/Button";
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import ConfirmationDialog from "../../../../components/Dialog";
import DefaultLayout from "../../../../components/DefaultLayout";
import SnackbarAlert from "../../../../components/SnackbarAlert";
import authServerSideProps from "../../../../src/authServerSideProps";
import { getRole } from "../../../../src/authUtils";
import { getLocalTime } from "../../../../src/formatUtils";
import handleFetchResource from "../../../../src/handleFetchResource";
import { validateFloat } from "../../../../src/validationUtils";

export async function getServerSideProps(context) {
    const initProps = await authServerSideProps(context);
    if (!initProps.props) {
        return initProps;
    }

    //non-admin cannot access this page
    if (getRole(initProps.props.homepage) !== 'admin') {
        return {
            redirect: {
                destination: initProps.props.homepage,
            }
        }
    }

    return {
        props: {
            customerId: context.params.id,
            accessToken: initProps.props.accessToken,
            homepage: initProps.props.homepage,
            currentPath: initProps.props.currentPath,
            requestURL: initProps.props.requestURL,
            authServerAddress: initProps.props.authServerAddress,
            serverAddress: process.env.SERVER_ADDRESS,
        }
    };
}

export default function CreateAccountPage(props) {
    const router = useRouter();

    const accountTypeSaving = "saving";
    const accountTypeChecking = "checking";
    const buttonLinkAccounts = `https://${props.serverAddress}/customers/${props.customerId}/account`;
    const errorDefaultMessage = "Please try again later.";

    const [isLoading, setIsLoading] = useState(false);
    const [selectedType, setSelectedType] = useState('');
    const [inputAmount, setInputAmount] = useState(0.00);
    const [isAmountInvalid, setIsAmountInvalid] = useState(false);
    const [errorMsg, setErrorMsg] = useState(errorDefaultMessage);
    const [openErrorAlert, setOpenErrorAlert] = useState(false);
    const [openConfirmation, setOpenConfirmation] = useState(false);
    const [newAccountInfo, setNewAccountInfo] = useState({opening_date: '', account_id: ''});

    function handleSelect(e) {
        if (e.target.value !== accountTypeSaving && e.target.value !== accountTypeChecking) {
            setErrorMsg("Account type should be saving or checking.");
            setOpenErrorAlert(true);
            return;
        }
        setSelectedType(e.target.value);
    }

    function checkInputAmount(rawAmt) {
        const [isValid, amt] = validateFloat(rawAmt, 5000.00, 99999999.99);
        if (!isValid) {
            setInputAmount(0.00);
            setIsAmountInvalid(true);
            return;
        }
        setIsAmountInvalid(false);
        setOpenErrorAlert(false); //clear any previous error
        setInputAmount(amt);
    }

    function handleGetConfirmation(event) {
        event.preventDefault();
        setErrorMsg(errorDefaultMessage);

        const isValid = event.target.checkValidity();
        if (!isValid || isAmountInvalid) {
            setErrorMsg("Please check that all fields are correctly filled.");
            setOpenErrorAlert(true);
        } else {
            setOpenConfirmation(true);
        }
    }

    async function handleNewAccount() {
        setIsLoading(true);
        setOpenConfirmation(false);

        const request = {
            method: "POST",
            headers: { "Authorization": "Bearer " + props.accessToken, "Content-Type": "application/json" },
            body: JSON.stringify({ "account_type": selectedType, "amount": inputAmount }),
        };

        const finalProps = await handleFetchResource(props.currentPath, props.requestURL, request);
        const responseData = finalProps?.props?.responseData || '';

        if (responseData === '') {
            const possibleRedirect = finalProps?.redirect?.destination || '';
            const possibleErrInfo = finalProps?.redirect || '';
            if (possibleRedirect !== '') {
                setErrorMsg(finalProps.redirect.errorMessage);
                setOpenErrorAlert(true);
                setTimeout(() => router.replace(possibleRedirect), 10000);
            } else if (possibleErrInfo !== '' && possibleErrInfo.isFormValidationError) {
                setErrorMsg(possibleErrInfo.errorMessage);
                setOpenErrorAlert(true);
            } else {
                console.log("No response after sending new account request");
                setErrorMsg("Something went wrong on our end, please try again later.");
                setOpenErrorAlert(true);
            }

            setIsLoading(false);
        } else {
            const openingDate = responseData.opening_date || '';
            const accountId = responseData.account_id || '';

            if (openingDate === '' || accountId === '') {
                console.log("Missing information in response after sending new account request");
                setErrorMsg("Something went wrong on our end, please try again later.");
                setOpenErrorAlert(true);
                return;
            }

            setIsLoading(false);
            setNewAccountInfo({opening_date: openingDate, account_id: accountId});
        }
    }

    return (
        <DefaultLayout
            homepage={props.homepage}
            authServerAddress={props.authServerAddress}
            tabTitle={"Account Opening"}
        >
            <Container className="container" component="main" maxWidth="sm">
                <Paper className="open-account__paper">
                    { newAccountInfo.opening_date === '' || newAccountInfo.account_id === '' ? (
                        <Box
                            component="form"
                            name="create-account-form"
                            autoComplete="off"
                            onSubmit={handleGetConfirmation}
                        >
                            <Typography variant="h4" align="center" fontWeight="600" marginBottom={1}>
                                Account Opening
                            </Typography>
                            <Typography className="typography--notice" variant="subtitle2" align="center" gutterBottom>
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
                                        label="Account Type"
                                        InputLabelProps={{
                                            htmlFor: 'select-account-type'
                                        }}
                                        inputProps={{
                                            id: 'select-account-type'
                                        }}
                                        fullWidth
                                        variant="standard"
                                        autoComplete="off"
                                        value={selectedType}
                                        onChange={handleSelect}
                                    >
                                        <MenuItem key={"option-saving"} value={"saving"}>Saving</MenuItem>
                                        <MenuItem key={"option-checking"} value={"checking"}>Checking</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        id="input-account-amount"
                                        label="Initial Amount"
                                        fullWidth
                                        variant="standard"
                                        inputProps={{ maxLength: 13 }}
                                        error={isAmountInvalid}
                                        helperText={isAmountInvalid ? "Please enter a valid amount." : ""}
                                        onChange={e => checkInputAmount(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} />
                                <ButtonLinkToAllCustomers serverAddress={props.serverAddress} />
                                <Grid className="button--location-grid right" item xs={6}>
                                    <Button className="button--type-submit" type="submit" variant="contained" disabled={isLoading}>
                                        {isLoading ? 'Loading...' : 'Submit'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    ) : (
                        <Grid container spacing={3} name="create-account-success-info">
                            <Grid item xs={12}>
                                <Typography className="icon--success" variant="h5" align="center">
                                    <CheckCircleIcon fontSize="small"/> Success.
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography component="p"  variant="subtitle1" align="center" fontWeight={600}>
                                    New Account No.: {newAccountInfo.account_id}
                                </Typography>
                                <Typography component="p"  variant="caption" align="center"  color="text.secondary">
                                    Time completed: {getLocalTime(newAccountInfo.opening_date)}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} />
                            <ButtonLinkToAllCustomers serverAddress={props.serverAddress} />
                            <Grid className="button--location-grid right" item xs={6} >
                                <Link href={buttonLinkAccounts}>
                                    <Button type="button" className="button--capitalization-off" size="small" endIcon={<ArrowForwardIosIcon/>}>
                                        Go to accounts for this customer
                                    </Button>
                                </Link>
                            </Grid>
                        </Grid>
                    )}
                </Paper>
            </Container>

            <ConfirmationDialog
                open={openConfirmation}
                handleNo={() => setOpenConfirmation(false)}
                handleYes={handleNewAccount}
                title={`Open ${selectedType} account of $${inputAmount}?`}
            />

            <SnackbarAlert
                openSnackbarAlert={openErrorAlert}
                handleClose={() => setOpenErrorAlert(false)}
                isError={true}
                title={"Failed to create account"}
                msg={errorMsg}
            />
        </DefaultLayout>
    );
}

function ButtonLinkToAllCustomers({serverAddress}) {
    console.log(serverAddress);
    const buttonLinkAllCustomers = `https://${serverAddress}/customers`;

    return (
        <Grid className="button--location-grid left" item xs={6}>
            <Link href={buttonLinkAllCustomers}>
                <Button type="button" className="button--capitalization-off" size="small" startIcon={<ArrowBackIosIcon/>}>
                    Back to customers
                </Button>
            </Link>
        </Grid>
    );
}
