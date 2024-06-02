import '../styles/global.css';

import Head from "next/head";

export default function FallbackPage() {
    return (
        <div>
            <Head>
                <title>Error</title>
            </Head>
            <p className="nojs__p">This site requires JavaScript to work. Please enable it to continue.</p>
        </div>
    );
}
