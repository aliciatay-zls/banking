import { useRouter } from "next/router";
import { forwardRef, useContext, useState } from "react";
import AlertTitle from "@mui/material/AlertTitle";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MuiAlert from "@mui/material/Alert";
import RadioGroup from '@mui/material/RadioGroup';
import Snackbar from "@mui/material/Snackbar";
import TextField from '@mui/material/TextField';

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
    const [errorAmount, setErrorAmount] = useState(false);
    const [error, setError] = useState('');
    const [openErrorAlert, setOpenErrorAlert] = useState(false);
    const [openConfirmation, setOpenConfirmation] = useState(false);

    const CustomAlert = forwardRef(function CustomAlert(props, ref) {
        return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
    });

    const accessToken = props.accessToken;
    const currentPath = props.currentPath;
    const requestURL = props.requestURL;

    function checkInputAmount(rawAmt) {
        const re = new RegExp("^[0-9]+$");
        if (re.test(rawAmt)) {
            const amt = parseInt(rawAmt, 10);
            if (!isNaN(amt) && amt >= 1 && amt <= 100000) {
                setErrorAmount(false);
                setOpenErrorAlert(false); //clear any previous error
                setInputAmount(amt);
                return;
            }
        }
        setInputAmount(0);
        setErrorAmount(true);
    }

    function handleCloseErrorAlert() {
        setOpenErrorAlert(false);
    }

    function handleGetConfirmation(event) {
        event.preventDefault();
        setError('');
        setDataToDisplay({
            isLoggingOut: false,
            pageData: [],
        }); //clear any previous data

        const isValid = event.target.checkValidity();
        if (!isValid || errorAmount) {
            setError("Please check that all fields are correctly filled.");
            setOpenErrorAlert(true);
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
                setOpenErrorAlert(true);
            } else {
                setError(finalProps.redirect.errorMessage);
                setOpenErrorAlert(true);
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
        >
            <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
                <Box
                    component="form"
                    name="transaction-form"
                    autoComplete="off"
                    onSubmit={handleGetConfirmation}
                    height="300px"
                    align="center"
                >
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <FormControl required>
                                <RadioGroup
                                    id="select-transaction-type"
                                    sx={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}
                                >
                                    <FormControlLabel
                                        value="deposit"
                                        control={
                                            <Button
                                                variant={selectedType === "deposit" ? "contained" : "outlined"}
                                                size="large"
                                                style={{textTransform: 'none'}}
                                                onClick={e => setSelectedType(e.target.value)}
                                            >
                                                Make a deposit
                                            </Button>
                                        }
                                        label=""
                                    />
                                    <FormControlLabel
                                        value="withdrawal"
                                        control={
                                            <Button
                                                variant={selectedType === "withdrawal" ? "contained" : "outlined"}
                                                size="large"
                                                margin={3}
                                                style={{textTransform: 'none'}}
                                                onClick={e => setSelectedType(e.target.value)}
                                            >
                                                Make a withdrawal
                                            </Button>
                                        }
                                        label=""
                                    />
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                inputMode="numeric"
                                id="input-transaction-amount"
                                label="Amount"
                                variant="standard"
                                size="small"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            $
                                        </InputAdornment>
                                    ),
                                }}
                                error={errorAmount === true}
                                helperText={errorAmount ? "Please enter a valid amount." : "Between $1 to $100,000"}
                                onChange={e => checkInputAmount(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button type="submit" variant="contained bank-theme">
                                Submit
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Container>

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

            <Snackbar
                open={openErrorAlert}
                autoHideDuration={5000}
                onClose={handleCloseErrorAlert}
            >
                <CustomAlert
                    severity={"error"}
                    sx={{ width: '100%' }}
                    onClose={handleCloseErrorAlert}
                >
                    <AlertTitle>Transaction failed.</AlertTitle>
                    {error}
                </CustomAlert>
            </Snackbar>
        </DefaultLayout>
    );
}
