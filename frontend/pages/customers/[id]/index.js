import Link from "next/link";
import { Fragment } from "react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FilterNoneSharpIcon from '@mui/icons-material/FilterNoneSharp';

import DefaultLayout from "../../../components/DefaultLayout";
import serverSideProps from "../../../src/serverSideProps";

export async function getServerSideProps(context) {
    return await serverSideProps(context);
}

export default function CustomerHomePage(props) {
    return (
        <DefaultLayout
            homepage={props.homepage}
            authServerAddress={props.authServerAddress}
            tabTitle={"My Accounts"}
            headerTitle={"My Accounts"}
        >
            {props.responseData && props.responseData.length > 0 ? (
                <Box className="accounts__box exist" component="main">
                    <Container className="container" maxWidth="lg">
                            <Grid container spacing={3}>
                                {props.responseData.map((acc) => (
                                    <Grid item key={acc["account_id"]} xs={12} md={4} lg={3}>
                                        <Paper className="accounts--individual">
                                            <BankAccount acc={acc} currentPath={props.currentPath}/>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                    </Container>
                </Box>
                ) : (
                <Box className="accounts__box none" component="main">
                    <Grid container spacing={4} direction="column">
                        <Grid item align="center" xs={4}>
                            <FilterNoneSharpIcon id="icon-no-accounts" />
                        </Grid>
                        <Grid className="grid restrict" item align="center" xs={4}>
                            <Typography variant="h6" color="text.secondary" align="center">
                                No bank accounts yet
                            </Typography>
                            <Typography variant="body2" color="text.secondary" align="center">
                                If you think this is a mistake or would like to open an account, please contact us.
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            )}
        </DefaultLayout>
    );
}

function BankAccount({acc, currentPath}) {
    const accountId = acc["account_id"];
    const accountDate = acc["opening_date"];
    const formattedAccountDate = accountDate.split(' ')[0] || accountDate;
    const accountType = acc["account_type"];
    const formattedAccountType = accountType[0].toUpperCase().concat(accountType.slice(1));
    const accountAmount = acc["amount"].toString();

    return (
        <Fragment>
            <Typography variant="h5" fontWeight={600}>
                {formattedAccountType} Account
            </Typography>
            <Typography color="text.secondary">
                {formattedAccountDate}&nbsp;&nbsp;{accountId}
            </Typography>
            <Typography className="accounts--individual-amount" component="p" variant="h6">
                ${accountAmount}
            </Typography>
            <div className="text--align-right">
                <Link href={currentPath.concat("/account/", accountId)}>
                    <Button className="button--capitalization-off" endIcon={<ArrowForwardIosIcon/>}>
                        Make a transaction
                    </Button>
                </Link>
            </div>
        </Fragment>
    );
}
