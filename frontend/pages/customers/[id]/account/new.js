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

import ConfirmationDialog from "../../../../components/dialog";
import DefaultLayout from "../../../../components/defaultLayout";
import SnackbarAlert from "../../../../components/snackbar";
import authServerSideProps from "../../../../src/authServerSideProps";
import { getHomepagePath } from "../../../../src/authUtils";
import handleFetchResource from "../../../../src/handleFetchResource";
import { validateFloat } from "../../../../src/validationUtils";

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

    const accountTypeSaving = "saving"
    const accountTypeChecking = "checking"
    const buttonLinkAccounts = `http://localhost:3000/customers/${props.customerId}/account`;
    const errorDefaultMessage = "Please try again later."

    const [selectedType, setSelectedType] = useState('');
    const [inputAmount, setInputAmount] = useState(0.00);
    const [isAmountInvalid, setIsAmountInvalid] = useState(false);
    const [errorMsg, setErrorMsg] = useState(errorDefaultMessage);
    const [openErrorAlert, setOpenErrorAlert] = useState(false);
    const [openConfirmation, setOpenConfirmation] = useState(false);
    const [newAccountInfo, setNewAccountInfo] = useState('');

    function handleSelect(e) {
        if (e.target.value !== accountTypeSaving && e.target.value !== accountTypeChecking) {
            setErrorMsg("Please check that the account type is correct.");
            setOpenErrorAlert(true);
            return;
        }
        setSelectedType(e.target.value);
    }

    function checkInputAmount(rawAmt) {
        const [isValid, amt] = validateFloat(rawAmt, 5000.00);
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
            return;
        }

        setNewAccountInfo(responseData);
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
                            <Typography variant="subtitle2" align="center" gutterBottom style={{ lineHeight: 1.2, marginBottom: 20,}}>
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
                                        onChange={handleSelect}
                                    >
                                        <MenuItem value={"saving"}>Saving</MenuItem>
                                        <MenuItem value={"checking"}>Checking</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        id="input-account-amount"
                                        label="Initial Amount"
                                        fullWidth
                                        variant="standard"
                                        error={isAmountInvalid}
                                        helperText={isAmountInvalid ? "Please enter a valid amount." : ""}
                                        onChange={e => checkInputAmount(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} />
                                <ButtonLinkToAllCustomers />
                                <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button type="submit" variant="contained" sx={{maxHeight: '40px'}}>
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
                                <Typography component="p"  variant="subtitle1" align="center" fontWeight={600}>
                                    New Account No.: {newAccountInfo.account_id}
                                </Typography>
                                <Typography component="p"  variant="caption" align="center"  color="text.secondary">
                                    Time completed: {newAccountInfo.opening_date}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} />
                            <ButtonLinkToAllCustomers />
                            <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Link href={buttonLinkAccounts}>
                                    <Button type="button" variant="no-caps" size="small" endIcon={<ArrowForwardIosIcon/>}>
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
