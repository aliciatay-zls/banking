import Head from "next/head";

import { LogoutAppBar } from "./appbar";

export default function DefaultLayout({ tabTitle, headerTitle, importantMsg, isCustomer, children }) {
    return (
        <div>
            <Head>
                <title>Banking App - {tabTitle}</title>
                <link rel="icon" type="image/png" href="/favicon-16x16.png" />
            </Head>

            <LogoutAppBar isCustomer={isCustomer}/>

            <div>
                <h1>{headerTitle}</h1>

                <p style={{ color: 'blue'}}>{importantMsg}</p>

                {children}
            </div>
        </div>
    );
}
