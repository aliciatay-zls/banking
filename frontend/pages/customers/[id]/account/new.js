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
    const [isAmountInvalid, setIsAmountInvalid] = useState(false);
    const [error, setError] = useState('');
    const [openErrorAlert, setOpenErrorAlert] = useState(false);
    const [openConfirmation, setOpenConfirmation] = useState(false);
    const [newAccountInfo, setNewAccountInfo] = useState('');

    const buttonLinkAccounts = `http://localhost:3000/customers/${props.customerId}/account`;

    function checkInputAmount(rawAmt) {
        const re = new RegExp("^[0-9]+$");
        if (re.test(rawAmt)) {
            const amt = parseInt(rawAmt, 10);
            if (!isNaN(amt) && amt >= 5000) {
                setIsAmountInvalid(false);
                setOpenErrorAlert(false); //clear any previous error
                setInputAmount(amt);
                return;
            }
        }
        setInputAmount(0);
        setIsAmountInvalid(true);
    }

    function handleGetConfirmation(event) {
        event.preventDefault();
        setError('');

        const isValid = event.target.checkValidity();
        if (!isValid || isAmountInvalid) {
            setError("Please check that all fields are correctly filled.");
            setOpenErrorAlert(true);
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
                setOpenErrorAlert(true);
            } else {
                setError(finalProps.redirect.errorMessage);
                setOpenErrorAlert(true);
                setTimeout(() => router.replace(possibleRedirect), 10000);
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
                handleNo={() => setOpenErrorAlert(false)}
                handleYes={handleNewAccount}
                title={`Open ${selectedType} account of $${inputAmount}?`}
            />

            <SnackbarAlert
                openSnackbarAlert={openErrorAlert}
                handleClose={() => setOpenErrorAlert(false)}
                isError={true}
                title={"Failed to create account"}
                msg={error}
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
