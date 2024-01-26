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

export default function ResendEmailButton({requestType, identifier}) {
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

    function resetStates() {
        setOpenOutcomeAlert(false);
        setIsError(false);
        setErrorMsg(defaultErrorMessage);
        setSuccessMsg(defaultSuccessMessage);
    }

    async function handleResend() {
        await resetStates();

        if (requestType === "" || identifier === "") {
            console.log("Error while resending confirmation link: Props are empty");
            setIsError(true);
            setOpenOutcomeAlert(true);
            return;
        }

        let response;
        if (requestType === "UsingToken") {
            response = await fetch(`https://127.0.0.1:8181/auth/register/resend?ott=${encodeURIComponent(identifier)}`);
        } else if (requestType === "UsingEmail") {
            if (!validateEmail(identifier)) {
                console.log("Email is not valid");
                setIsError(true);
                setOpenOutcomeAlert(true);
                return;
            }
            const request = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "email": identifier })
            };
            response = await fetch("https://127.0.0.1:8181/auth/register/resend", request);
        } else {
            console.log("Error while resending confirmation link: Unknown request type");
            setIsError(true);
            setOpenOutcomeAlert(true);
            return;
        }

        const data = await response.json();
        if (!response.ok) {
            const responseErrorMsg = data.message || '';
            console.log("HTTP error while resending confirmation link: " + responseErrorMsg);

            if (response.status === 422) {
                if (responseErrorMsg === "Already confirmed") {
                    setSuccessMsg({title: responseErrorMsg, msg: "Redirecting you to login now..."})
                    setOpenOutcomeAlert(true);
                    setTimeout(() => router.replace('/login'), 5000);
                    return;
                } else if (responseErrorMsg === "Maximum daily attempts reached") {
                    setErrorMsg({title: responseErrorMsg, msg: "Please try logging in tomorrow, or contact us if the issue persists."});
                    setIsDisabled(true);
                    setIsDisabledForever(true);
                } else if (responseErrorMsg === "Too many attempts") {
                    setErrorMsg({title: responseErrorMsg, msg: "Please try again after 1 minute."});
                    setIsDisabled(true);
                }
            }
            setIsError(true);
            setOpenOutcomeAlert(true);
            return;
        }

        setOpenOutcomeAlert(true);
    }

    return (
        <Fragment>
            <Button
                variant={isDisabled ? "contained" : "contained bank-theme"}
                sx={{ mt: 3, mb: 2, textTransform: 'none' }}
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
