import Head from "next/head";

import { BaseAppBar } from "./appbar";

export default function LoginLayout({ tabTitle, headerTitle, children }) {
    const title = `Banking App - ${tabTitle}`;
    return (
        <div>
            <Head>
                <title>{title}</title>
                <link rel="icon" type="image/png" href="/favicon.ico" />
            </Head>

            <BaseAppBar/>

            <div>
                <h1>{headerTitle}</h1>

                {children}
            </div>
        </div>
    );
}
