import Head from "next/head";
import Alert from '@mui/material/Alert';

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

            <div>
                { isTOB &&
                    <Alert severity="info">
                        You are acting on behalf of this customer.
                    </Alert>
                }

                <h1>{headerTitle}</h1>

                <p style={{ color: 'blue'}}>{importantMsg}</p>

                {children}
            </div>
        </div>
    );
}
