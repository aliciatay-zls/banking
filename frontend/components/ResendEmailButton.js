import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import Button from "@mui/material/Button";

import SnackbarAlert from "./SnackbarAlert";
import { validateEmail } from "../src/validationUtils";

const defaultErrorMessage = {
    title: "Could not resend confirmation link at this time.",
    msg: "Please try again later.",
};
const defaultSuccessMessage = {
    title: "A new confirmation link has been sent to the same email.",
};

export default function ResendEmailButton({requestType, identifier, authServerAddress}) {
    const router = useRouter();

    const [openOutcomeAlert, setOpenOutcomeAlert] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMsg, setErrorMsg] = useState(defaultErrorMessage);
    const [isDisabled, setIsDisabled] = useState(false);
    const [isDisabledForever, setIsDisabledForever] = useState(false);
    const [successMsg, setSuccessMsg] = useState(defaultSuccessMessage);

    useEffect(() => {
        if (isDisabled && !isDisabledForever) {
            setTimeout(() => setIsDisabled(false), 60000);
        }
    }, [isDisabled]);

    async function handleResend() {
        await resetStates();

        if (requestType === "" || identifier === "") {
            showError("Error while resending confirmation link: Props are empty", {});
            return;
        }

        let response, responseErrorMsg;
        try {
            if (requestType === "UsingToken") {
                response = await fetch(`https://${authServerAddress}/auth/register/resend?ott=${encodeURIComponent(identifier)}`);
            } else if (requestType === "UsingEmail") {
                if (!validateEmail(identifier)) {
                    showError("Email is not valid", defaultErrorMessage);
                    return;
                }
                const request = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ "email": identifier })
                };
                response = await fetch(`https://${authServerAddress}/auth/register/resend`, request);
            } else {
                showError("Error while resending confirmation link: Unknown request type", defaultErrorMessage);
                return;
            }

            const data = await response.json();
            if (!response.ok) {
                responseErrorMsg = data.message || '';

                if (response.status === 422) {
                    if (responseErrorMsg === "Already confirmed") {
                        showSuccess({title: responseErrorMsg, msg: "Redirecting you to login now..."});
                        setTimeout(() => router.replace('/login'), 5000);
                    } else if (responseErrorMsg === "Maximum daily attempts reached") {
                        showError('', {title: responseErrorMsg, msg: "Please try logging in tomorrow, or contact us if the issue persists."})
                        setIsDisabled(true);
                        setIsDisabledForever(true);
                    } else if (responseErrorMsg === "Too many attempts") {
                        showError('', {title: responseErrorMsg, msg: "Please try again after 1 minute."});
                        setIsDisabled(true);
                    }
                    return;
                }

                //if error is not 422, show response received or default error message
                showError('', responseErrorMsg !== '' ? {title: responseErrorMsg, msg: ''} : defaultErrorMessage);
            } else {
                showSuccess(defaultSuccessMessage);
            }
        } catch (err) { //any unexpected errors (exceptions) e.g. fetch TypeError
            console.log(err);
            showError('', defaultErrorMessage);
        }
    }

    function resetStates() {
        setOpenOutcomeAlert(false);
        setIsError(false);
        setErrorMsg(defaultErrorMessage);
        setSuccessMsg(defaultSuccessMessage);
    }

    function showError(specificLogMsg, errorMessage) {
        console.log((specificLogMsg !== '' ? specificLogMsg : "HTTP error while resending confirmation link: " + errorMessage.title));
        setIsError(true);
        setErrorMsg(errorMessage);
        setOpenOutcomeAlert(true);
    }

    function showSuccess(successMessage) {
        setSuccessMsg(successMessage);
        setOpenOutcomeAlert(true);
    }

    return (
        <Fragment>
            <Button
                className="button--type-resend button--style-bank"
                variant="contained"
                onClick={handleResend}
                disabled={isDisabled}
            >
                Resend confirmation email
            </Button>
            <SnackbarAlert
                openSnackbarAlert={openOutcomeAlert}
                handleClose={() => setOpenOutcomeAlert(false)}
                isError={isError}
                title={isError ? errorMsg.title : successMsg.title}
                msg={isError ? errorMsg.msg : successMsg.msg}
            />
        </Fragment>
    );
}
