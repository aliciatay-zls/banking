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
import { getLocalTime } from "../../../../../src/formatUtils";

export async function getServerSideProps(context) {
    const initProps = await authServerSideProps(context);
    if (!initProps.props) {
        return initProps;
    }

    const customerID = context.params?.id || '';
    const accountID = context.params?.acc_id || '';
    const beforeURL = `https://${process.env.SERVER_ADDRESS}/customers/${customerID}/account/${accountID}`;
    const myAccountsURL = `https://${process.env.SERVER_ADDRESS}/customers/${customerID}/account`;

    return {
        props: {
            homepage: initProps.props.homepage,
            accountID: accountID,
            beforeURL: beforeURL,
            myAccountsURL: myAccountsURL,
            authServerAddress: initProps.props.authServerAddress,
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
            authServerAddress={props.authServerAddress}
            tabTitle={"Success"}
        >
            { transactionID === '' || transactionDate === '' &&
                <Box height="100vh" align="center">
                    <Backdrop className="backdrop" open={isLoading}>
                        <CircularProgress color="inherit" />
                    </Backdrop>
                </Box>
            }

            { transactionID !== '' && transactionDate !== '' &&
                <Container className="container" component="main" maxWidth="sm">
                    <Paper className="open-account__paper" variant="outlined">
                        <Box name="transaction-success-page" align="center">
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Typography className="icon--success" variant="h5">
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
                                        Time completed: {getLocalTime(transactionDate)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} />
                                <Grid item xs={12} />
                                <Grid className="button--grid left" item xs={12}>
                                    <Link href={props.beforeURL}>
                                        <Button type="button" variant="no-caps" size="small" startIcon={<ArrowBackIosIcon/>}>
                                            Make another transaction for this account
                                        </Button>
                                    </Link>
                                </Grid>
                                <Grid className="button--grid left" item xs={12}>
                                    <Link href={props.myAccountsURL}>
                                        <Button type="button" variant="no-caps" size="small" startIcon={<ArrowBackIosIcon/>}>
                                            Go back to my accounts
                                        </Button>
                                    </Link>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </Container>
            }
        </DefaultLayout>
    );
}
