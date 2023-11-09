import Head from "next/head";
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { DefaultAppBar } from "./appbar";

export default function DefaultLayout({ clientInfo, isPossibleTOB = true, tabTitle, headerTitle, importantMsg, children }) {
    const title = `Banking App - ${tabTitle}`;
    const isTOB = isPossibleTOB && ((clientInfo?.role || '') === 'admin');

    return (
        <div>
            <Head>
                <title>{title}</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <DefaultAppBar clientInfo={clientInfo}/>

            { isTOB &&
                <Alert severity="info">
                    You are acting on behalf of this customer.
                </Alert>
            }

            <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
                <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                    <Typography variant="h4" align="center">
                        {headerTitle}
                    </Typography>

                    {children}
                </Paper>
            </Container>
        </div>
    );
}
