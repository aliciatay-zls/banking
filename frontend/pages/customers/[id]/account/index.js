import Link from "next/link";
import { Fragment } from "react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import DefaultLayout from "../../../../components/defaultLayout";
import serverSideProps from "../../../../src/serverSideProps";

export async function getServerSideProps(context) {
    return await serverSideProps(context);
}

export default function AccountsPage(props) {
    return (
        <DefaultLayout
            clientInfo={props.clientInfo}
            tabTitle={"My Accounts"}
            headerTitle={"My Accounts"}
        >
            <Box
                component="main"
                sx={{
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'light'
                            ? theme.palette.grey[100]
                            : theme.palette.grey[900],
                    flexGrow: 1,
                    height: '100vh',
                    overflow: 'auto',
                }}
            >
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <Grid container spacing={3}>
                        {props.responseData && props.responseData.map( (acc) => (
                                <Grid item key={acc["account_id"]} xs={12} md={4} lg={3}>
                                    <Paper
                                        sx={{
                                            p: 2,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: 200,
                                        }}
                                    >
                                        <BankAccount acc={acc} currentPath={props.currentPath}/>
                                    </Paper>
                                </Grid>
                            ))
                        }
                    </Grid>
                </Container>
            </Box>
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
            <Typography component="p" variant="h6" sx={{ flex: 1 }}>
                ${accountAmount}
            </Typography>
            <div>
                <Link href={currentPath.concat("/", accountId)}>
                    <Button variant="no-caps" endIcon={<ArrowForwardIosIcon/>}>
                        Make a transaction
                    </Button>
                </Link>
            </div>
        </Fragment>
    );
}
