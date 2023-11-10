import Head from "next/head";
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

import { DefaultAppBar } from "./appbar";
import BankFooter from "./footer";

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
                <Typography variant="body1">
                    <Alert severity="info" sx={{fontSize: "inherit"}}>
                        You are acting on behalf of this customer.
                    </Alert>
                </Typography>
            }

            <Typography variant="h4" align="center" marginTop={5} marginBottom={3}>
                {headerTitle}
            </Typography>

            {children}

            <BankFooter/>
        </div>
    );
}
