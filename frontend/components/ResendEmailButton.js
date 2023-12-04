import { Fragment, useState } from "react";
import Button from "@mui/material/Button";

import SnackbarAlert from "./snackbar";

const errorMessage = {
    title: "Could not resend confirmation link at this time.",
    msg: "Please try again later.",
};
const successMessage = {
    title: "A new confirmation link has been sent to the same email.",
};

export default function ResendEmailButton({requestType, identifier}) {
    const [openOutcomeAlert, setOpenOutcomeAlert] = useState(false);
    const [isError, setIsError] = useState(true);

    async function handleResend() {
        setIsError(false); //clear previous state

        if (requestType === "" || identifier === "") {
            console.log("Error while resending confirmation link: Props are empty");
            setIsError(true);
            setOpenOutcomeAlert(true);
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
            setIsError(true);
            setOpenOutcomeAlert(true);
            return;
        }

        const data = await response.json();
        if (!response.ok) {
            const errorMessage = data.message || '';
            console.log("HTTP error while resending confirmation link: " + errorMessage);
            setIsError(true);
            setOpenOutcomeAlert(true);
            return;
        }

        setIsError(false);
        setOpenOutcomeAlert(true);
    }

    return (
        <Fragment>
            <Button
                variant="contained bank-theme"
                sx={{ mt: 3, mb: 2, textTransform: 'none' }}
                onClick={handleResend}
            >
                Resend confirmation email
            </Button>
            <SnackbarAlert
                openSnackbarAlert={openOutcomeAlert}
                handleClose={() => setOpenOutcomeAlert(false)}
                isError={isError}
                title={isError ? errorMessage.title : successMessage.title}
                msg={isError ? errorMessage.msg : ""}
            />
        </Fragment>
    );
}
