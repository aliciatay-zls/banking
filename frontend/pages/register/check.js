import Link from "next/link";
import { useState } from "react";
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from '@mui/icons-material/Error';

import RegisterLayout from "../../components/RegisterLayout";

export async function getServerSideProps(context) {
    const ott = context.query.ott || '';
    if (ott === '') {
        console.log("Redirecting to 404 page");
        return {
            notFound: true,
        };
    }

    try {
        //send request to check token in url
        const checkResponse = await fetch(`http://127.0.0.1:8181/auth${context.resolvedUrl}`);
        const checkData = await checkResponse.json();

        const responseMsg = checkData?.message || '';

        if (!checkResponse.ok) {
            console.log("HTTP error while checking registration")

            if (responseMsg === "Expired OTT") {
                console.log(responseMsg);
                return {
                    props: {
                        isExpired: true,
                        ott: ott,
                    }
                };
            }

            return {
                props: {
                    isOtherError: true,
                }
            };
        }

        //skip the next part
        if (responseMsg === "Registration already confirmed") {
            return {
                props: { }
            };
        }

        //send request to complete the registration
        const request = {
            method: "POST",
            body: JSON.stringify({"one_time_token": ott}),
        };
        const finishResponse = await fetch("http://127.0.0.1:8181/auth/register/finish", request);
        const finishData = await finishResponse.json();

        if (!finishResponse.ok) {
            console.log("HTTP error while finishing registration");
            const errorMessage = finishData.message || '';

            if (errorMessage === "Expired OTT") {
                console.log(errorMessage);
                return {
                    props: {
                        isExpired: true,
                        ott: ott,
                    }
                };
            }

            return {
                props: {
                    isOtherError: true,
                }
            };
        }

        return {
            props: { }
        };

    } catch (err) {
        console.log(err);
        return {
            redirect: {
                destination: `/login?errorMessage=${encodeURIComponent("Something went wrong.")}`,
            }
        };
    }
}

function getHeaderTitle(isExpired, isOtherError) {
    if (isExpired || isOtherError) {
        return (
            <span style={{color: "red"}}><ErrorIcon /> {isExpired ? "Link has expired." : "Something went wrong."}</span>
        );
    }
    return (
        <span style={{color: "green"}}><CheckCircleIcon /> Email successfully confirmed.</span>
    );
}

export default function CheckRegistrationPage(props) {
    const [resendOutcome, setResendOutcome] = useState('');

    const isExpired = props.isExpired || false;
    const isOtherError = props.isOtherError || false;
    const ott = props.ott || '';

    async function handleResend() {
        console.log("resend using " + ott);
        const response = await fetch(`http://127.0.0.1:8181/auth/register/resend?ott=${encodeURIComponent(ott)}`);
        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data.message || '';
            console.log("HTTP error while resending confirmation link: " + errorMessage);
            setResendOutcome("Could not resend confirmation link at this time. Please try again later.");
            return;
        }

        setResendOutcome("A new confirmation link has been sent to the same email.");
    }

    return (
        <RegisterLayout
            isForm={false}
            tabTitle="Confirm Email"
            headerTitle={getHeaderTitle(isExpired, isOtherError)}
        >
            <Grid container spacing={2}>
                <Grid item xs={12} align="center" sx={{ mt: 3 }}>
                    { isExpired &&
                        <Button
                            variant="contained bank-theme"
                            sx={{ mt: 3, mb: 2, textTransform: 'none' }}
                            onClick={handleResend}
                        >
                            Resend confirmation email
                        </Button>
                    }
                    { isOtherError &&
                        <Typography component="p" variant="body1">
                            Please try again later.
                        </Typography>
                    }
                    { !isExpired && !isOtherError &&
                        <Typography component="p" variant="body1">
                            Please <Link href={'/login'}>login again</Link>.
                        </Typography>
                    }
                </Grid>
                { resendOutcome &&
                    <Grid item xs={12} align="center">
                        <Typography component="p" variant="body1">
                            {resendOutcome}
                        </Typography>
                    </Grid>
                }
            </Grid>
        </RegisterLayout>
    );
}
