import Head from "next/head";

import { LoginAppBar } from "./appbar";

export default function LoginLayout({ tabTitle, headerTitle, children }) {
    return (
        <div>
            <Head>
                <title>Banking App - {tabTitle}</title>
                <link rel="icon" type="image/png" href="/favicon-16x16.png" />
            </Head>

            <LoginAppBar/>

            <div>
                <h1>{headerTitle}</h1>

                {children}
            </div>
        </div>
    );
}
