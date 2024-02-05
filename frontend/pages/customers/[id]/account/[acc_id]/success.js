import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { DataToDisplayContext } from "../../../../_app";
import DefaultLayout from "../../../../../components/DefaultLayout";
import authServerSideProps from "../../../../../src/authServerSideProps"

export async function getServerSideProps(context) {
    const initProps = await authServerSideProps(context);
    if (!initProps.props) {
        return initProps;
    }

    const customerID = context.params?.id || '';
    const accountID = context.params?.acc_id || '';
    const beforeURL = `https://localhost:3000/customers/${customerID}/account/${accountID}`;
    const myAccountsURL = `https://localhost:3000/customers/${customerID}/account`;

    return {
        props: {
            homepage: initProps.props.homepage,
            accountID: accountID,
            beforeURL: beforeURL,
            myAccountsURL: myAccountsURL,
        },
    };
}

export default function TransactionSuccessPage(props) {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const { dataToDisplay } = useContext(DataToDisplayContext);
    const pageData = dataToDisplay?.pageData || [];

    useEffect(() => {
        if (pageData.length < 2 && !dataToDisplay.isLoggingOut) {
            console.log("Missing information on transaction result. Redirecting back to transaction page.");
            router.replace(props.beforeURL);
        } else {
            setIsLoading(false);
        }
    }, []);

    const transactionID = pageData[0]?.transaction_id || '';
    const newBalance = pageData[0]?.new_balance || 0;
    const transactionDate = pageData[0]?.transaction_date || '';
    const transactionType = pageData[1] || '';
    const headerTitle = transactionType !== '' ? `Your ${transactionType} was successful.` : '';

    return (
        <DefaultLayout
            homepage={props.homepage}
            tabTitle={"Success"}
        >
            <Container component="main" maxWidth="sm" sx={{ mb: 5, mt: 5 }}>
                { transactionID === '' || newBalance === '' &&
                    <Box height="300px" align="center">
                        <Backdrop
                            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                            open={isLoading}
                        >
                            <CircularProgress color="inherit" />
                        </Backdrop>
                    </Box>
                }

                { transactionID !== '' && newBalance !== '' &&
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
                        <Box name="transaction-success-page" align="center">
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Typography variant="h5" style={{color: 'green', marginTop: 20}}>
                                        <CheckCircleIcon fontSize="small"/> {headerTitle}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        Balance: ${newBalance}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography component="p" variant="caption" color="text.secondary">
                                        Account No.: {props.accountID}
                                    </Typography>
                                    <Typography component="p" variant="caption" color="text.secondary">
                                        Time completed: {transactionDate}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} />
                                <Grid item xs={12} />
                                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                    <Link href={props.beforeURL}>
                                        <Button type="button" variant="no-caps" size="small" startIcon={<ArrowBackIosIcon/>}>
                                            Make another transaction for this account
                                        </Button>
                                    </Link>
                                </Grid>
                                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                    <Link href={props.myAccountsURL}>
                                        <Button type="button" variant="no-caps" size="small" startIcon={<ArrowBackIosIcon/>}>
                                            Go back to my accounts
                                        </Button>
                                    </Link>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                }
            </Container>
        </DefaultLayout>
    );
}
