import { Fragment, useState } from "react";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export default function ResendEmailButton({requestType, identifier}) {
    const [resendOutcome, setResendOutcome] = useState('');
    const errorDefaultMessage = "Could not resend confirmation link at this time. Please try again later.";

    async function handleResend() {
        if (requestType === "" || identifier === "") {
            console.log("Error while resending confirmation link: Props are empty");
            setResendOutcome(errorDefaultMessage);
            return;
        }

        let response;
        if (requestType === "UsingToken") {
            response = await fetch(`http://127.0.0.1:8181/auth/register/resend?ott=${encodeURIComponent(identifier)}`);
        } else if (requestType === "UsingEmail") {
            const request = {
                method: "POST",
                body: JSON.stringify({email: identifier})
            };
            response = await fetch("http://127.0.0.1:8181/auth/register/resend", request);
        } else {
            console.log("Error while resending confirmation link: Unknown request type");
            setResendOutcome(errorDefaultMessage);
            return;
        }

        const data = await response.json();
        if (!response.ok) {
            const errorMessage = data.message || '';
            console.log("HTTP error while resending confirmation link: " + errorMessage);
            setResendOutcome(errorDefaultMessage);
            return;
        }

        setResendOutcome("A new confirmation link has been sent to the same email.");
    }

    return (
        <Fragment>
            <Grid item xs={12} align="center" sx={{ mt: 3 }}>
                <Button
                    variant="contained bank-theme"
                    sx={{ mt: 3, mb: 2, textTransform: 'none' }}
                    onClick={handleResend}
                >
                    Resend confirmation email
                </Button>
            </Grid>
            { resendOutcome &&
                <Grid item xs={12} align="center">
                    <Typography component="p" variant="body1">
                        {resendOutcome}
                    </Typography>
                </Grid>
            }
        </Fragment>
    );
}
