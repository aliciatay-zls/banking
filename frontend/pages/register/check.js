import Link from "next/link";
import { Fragment } from "react";
import isJWT from 'validator/lib/isJWT';
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
                permanent: false,
            }
        };
    }

    const ott = context.query.ott || '';
    if (ott === '' || !isJWT(ott)) {
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
            <Fragment>
                <ErrorIcon color="error" sx={{fontSize: '40px', mb: -3}} />
                <p>{isExpired ? "This link has expired." : "Something went wrong."}</p>
            </Fragment>
        );
    }
    return (
        <Fragment>
            <CheckCircleIcon color="success" sx={{fontSize: '40px', mb: -3}} />
            <p>Email successfully confirmed.</p>
            <Typography component="div" variant="h4" align="right">
                <Link href={'/login'}>
                    <Button type="button" variant="no-caps" size="small" endIcon={<ArrowForwardIosIcon/>} sx={{mt: -3}}>
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