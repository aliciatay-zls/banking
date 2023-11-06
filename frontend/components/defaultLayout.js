import Head from "next/head";

import { DefaultAppBar } from "./appbar";

export default function DefaultLayout({ clientInfo, tabTitle, headerTitle, importantMsg, children }) {
    const title = `Banking App - ${tabTitle}`;
    return (
        <div>
            <Head>
                <title>{title}</title>
                <link rel="icon" type="image/png" href="/favicon.ico" />
            </Head>

            <DefaultAppBar clientInfo={clientInfo}/>

            <div>
                <h1>{headerTitle}</h1>

                <p style={{ color: 'blue'}}>{importantMsg}</p>

                {children}
            </div>
        </div>
    );
}
