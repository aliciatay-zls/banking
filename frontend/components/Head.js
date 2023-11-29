import Head from "next/head";

export default function BankHead({ title }) {
    return (
        <Head>
            <title>{`Banking App - ${title}`}</title>
            <link rel="icon" href="/favicon.ico" />
        </Head>
    );
}
