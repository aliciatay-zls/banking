import Link from "next/link";
import Grid from '@mui/material/Grid';
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from '@mui/icons-material/Error';

import RegisterLayout from "../../components/RegisterLayout";
import ResendEmailButton from "../../components/ResendEmailButton";

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
    const isExpired = props.isExpired || false;
    const isOtherError = props.isOtherError || false;
    const ott = props.ott || '';

    return (
        <RegisterLayout
            isForm={false}
            tabTitle="Confirm Email"
            headerTitle={getHeaderTitle(isExpired, isOtherError)}
        >
            <Grid container spacing={2}>
                { isExpired &&
                    <ResendEmailButton requestType={"UsingToken"} identifier={ott} />
                }
                <Grid item xs={12} align="center" sx={{ mt: 3 }}>
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
            </Grid>
        </RegisterLayout>
    );
}
