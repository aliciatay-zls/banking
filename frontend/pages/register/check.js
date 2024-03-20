import Link from "next/link";
import { Fragment } from "react";
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from "@mui/material/Typography";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from '@mui/icons-material/Error';

import RegisterLayout from "../../components/RegisterLayout";
import ResendEmailButton from "../../components/ResendEmailButton";
import { checkIsLoggedIn } from "../../src/authUtils";

export async function getServerSideProps(context) {
    const [isLoggedIn, ] = checkIsLoggedIn(context);
    if (isLoggedIn){
        return {
            redirect: {
                destination: '/login',
            }
        };
    }

    const ott = context.query.ott || '';
    if (ott === '') {
        console.log("Redirecting to 404 page");
        return {
            notFound: true,
        };
    }

    try {
        //send request to check token in url
        const checkResponse = await fetch(`https://127.0.0.1:8181/auth${context.resolvedUrl}`);
        const checkData = await checkResponse.json();

        const responseMsg = checkData?.message || '';

        if (!checkResponse.ok) {
            console.log("HTTP error while checking registration: " + responseMsg);

            if (responseMsg === "expired OTT") {
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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "one_time_token": ott }),
        };
        const finishResponse = await fetch("https://127.0.0.1:8181/auth/register/finish", request);
        const finishData = await finishResponse.json();

        if (!finishResponse.ok) {
            console.log("HTTP error while finishing registration");
            const errorMessage = finishData.message || '';

            if (errorMessage === "expired OTT") {
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
            <Fragment>
                <ErrorIcon className="icon--standalone" color="error" />
                <p>{isExpired ? "This link has expired." : "Something went wrong."}</p>
            </Fragment>
        );
    }
    return (
        <Fragment>
            <CheckCircleIcon className="icon--standalone" color="success" />
            <p>Email successfully confirmed.</p>
            <Typography component="div" variant="h4" align="right">
                <Link href={'/login'}>
                    <Button className="button--confirmed" type="button" variant="no-caps" size="small" endIcon={<ArrowForwardIosIcon/>}>
                        Login again
                    </Button>
                </Link>
            </Typography>

        </Fragment>
    );
}

export default function CheckRegistrationPage(props) {
    const isExpired = props.isExpired || false;
    const isOtherError = props.isOtherError || false;
    const ott = props.ott || '';

    return (
        <RegisterLayout
            isForm={false}
            tabTitle="Email Confirmation"
            headerTitle={getHeaderTitle(isExpired, isOtherError)}
        >
            <Grid item xs={12} align="center">
                { isExpired &&
                    <ResendEmailButton requestType={"UsingToken"} identifier={ott} />
                }
                { isOtherError &&
                    <Typography component="p" variant="body1">
                        Please try again later or contact us if the issue persists.
                    </Typography>
                }
            </Grid>
        </RegisterLayout>
    );
}
