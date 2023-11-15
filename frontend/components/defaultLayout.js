import Head from "next/head";
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

import { DefaultAppBar } from "./appbar";
import BankFooter from "./footer";

export default function DefaultLayout({ clientInfo, isPossibleTOB = true, tabTitle, headerTitle, children }) {
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
                <Alert severity="info" sx={{fontSize: "inherit"}}>
                    <Typography variant="body1">
                        You are acting on behalf of this customer.
                    </Typography>
                </Alert>
            }

            <Typography variant="h4" align="center" fontWeight="600" marginTop={5} marginBottom={3}>
                {headerTitle}
            </Typography>

            {children}

            <BankFooter/>
        </div>
    );
}
