import Head from "next/head";

export default function BankHead({ title }) {
    return (
        <Head>
            <title>{`BANK - ${title}`}</title>
            <link rel="icon" href="/favicon.ico" />
        </Head>
    );
}
