import { Fragment, useState } from "react";
import isAscii from 'validator/lib/isAscii';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';

import EmailConfirmation from "./EmailConfirmation";
import LoginDetailsForm from "./LoginDetailsForm";
import PersonalDetailsForm, { Countries } from "./PersonalDetailsForm";
import RegisterLayout from "../../components/RegisterLayout";
import SnackbarAlert from "../../components/snackbar";
import * as v from "../../src/validationUtils";

const steps = [
    'Personal Details',
    'Login Details',
    'Email Confirmation',
];
const stepFieldNames = {
    0: ['firstName', 'lastName', 'email', 'dob', 'country', 'zipcode'],
    1: ['username', 'password'],
};
const alreadyRegisteredMessages = [
    "Email is already used",
    "Email is already registered for an account and already confirmed",
    "Email is already registered for an account but not confirmed",
];
const errorDefaultMessage = "Registration failed";

export default function RegistrationPage() {
    const [activeStep, setActiveStep] = useState(0);
    const [fields, setFields] = useState({
        firstName: "",
        lastName: "",
        email: "",
        dob: "",
        country: "Singapore",
        zipcode: "",
        username: "",
        password: "",
        confirmPassword: "",
        tcCheckbox: false,
    });
    const [errorTitle, setErrorTitle] = useState(errorDefaultMessage);
    const [errorMsg, setErrorMsg] = useState('');
    const [openErrorAlert, setOpenErrorAlert] = useState(false);
    const [successInfo, setSuccessInfo] = useState({});

    //record field value whenever it changes
    function handleChange(event) {
        const { name, value } = event.target;

        let newValue = value;
        if (name === "tcCheckbox") {
            newValue = event.target.checked;
        } else if (name === "firstName" || name === "lastName") {
            newValue = v.capitalize(value);
        }

        setFields({
            ...fields,
            [name]: newValue,
        });
    }

    //check field inputs for PersonalDetailsForm
    function handleNext(event) {
        event.preventDefault();
        resetErrorAlert();

        if (!isFieldsFilledAndEnglish(activeStep) || !validatePersonalDetails()) {
            return;
        }

        setActiveStep(activeStep + 1);
    }

    function handleBack() {
        setActiveStep(activeStep - 1);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        resetErrorAlert();

        //do all checks for previous form again
        if (!isFieldsFilledAndEnglish(activeStep - 1) || !validatePersonalDetails()) {
            return;
        }
        //do checks for current form
        if (!isFieldsFilledAndEnglish(activeStep) || !validateLoginDetails()) {
            return;
        }

        const request = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "full_name": v.removeSpaces(fields.firstName).concat(" ", v.removeSpaces(fields.lastName)),
                "country": fields.country,
                "zipcode": fields.zipcode,
                "date_of_birth": fields.dob,
                "email": fields.email,
                "username": fields.username,
                "password": fields.password,
            }),
        };

        try {
            const response = await fetch("http://127.0.0.1:8181/auth/register", request);
            const data = await response.json();

            if (!response.ok) {
                const responseErrMsg = data?.message || '';
                console.log("HTTP error during registration: "+ responseErrMsg);

                if (response.status === 409) { //"Username is already taken"
                    setErrorMsg(responseErrMsg);
                } else if (alreadyRegisteredMessages.indexOf(responseErrMsg) !== -1) {
                    setErrorMsg("Already registered before.");
                } else {
                    setErrorMsg("Please try again later.");
                }

                setOpenErrorAlert(true);
                return;
            }

            setSuccessInfo(data);
            setActiveStep(activeStep + 1);

        } catch (err) {
            console.log(err);
            setErrorMsg(err.message);
            setOpenErrorAlert(true);
        }
    }

    function isFieldsFilledAndEnglish(step) {
        const fieldNames = stepFieldNames[step];
        for (let i=0; i<fieldNames.length; i++) {
            const val = fields[fieldNames[i]];
            if (val === "") {
                openValidationErrorAlert("Please check that all fields are filled.");
                return false;
            }
            if (!isAscii(val)) {
                openValidationErrorAlert("Please ensure that all fields are in English.");
                return false;
            }
        }
        return true;
    }

    function validatePersonalDetails() {
        if (!v.validateName(fields.firstName, fields.lastName)) {
            openValidationErrorAlert("Please check that the First Name and Last Name do not contain numbers.");
            return false;
        }
        if (!v.validateEmail(fields.email)) {
            openValidationErrorAlert("Please check that the Email entered is correct.");
            return false;
        }
        if (!v.validateDOB(fields.dob)) {
            openValidationErrorAlert("Please check that the Date of Birth entered is correct.");
            return false;
        }
        if (!Countries.includes(fields.country)) {
            openValidationErrorAlert("Please check that the Country selected is correct.");
            return false;
        }
        if (!v.validateZipcode(fields.zipcode)) {
            openValidationErrorAlert("Please check that the Postal/Zip Code entered is correct.");
            return false;
        }

        return true;
    }

    function validateLoginDetails() {
        if (!v.validateNewUsername(fields.username)) {
            openValidationErrorAlert("Please check that the Username meets the requirements");
            return false;
        }
        if (!v.validateNewPassword(fields.password)) {
            openValidationErrorAlert("Please check that the Password meets the requirements");
            return false;
        }
        if (fields.password !== fields.confirmPassword) {
            openValidationErrorAlert("Passwords do not match");
            return false;
        }
        if (!fields.tcCheckbox) {
            openValidationErrorAlert("Please review and accept the terms and conditions");
            return false;
        }

        return true;
    }

    function openValidationErrorAlert(msg) {
        setErrorTitle("Cannot continue");
        setErrorMsg(msg);
        setOpenErrorAlert(true);
    }

    function resetErrorAlert() {
        setErrorTitle(errorDefaultMessage);
        setErrorMsg('');
        setOpenErrorAlert(false);
    }

    return (
        <RegisterLayout
            tabTitle="Register"
            headerTitle="Registration"
        >
            <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 3 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <Grid container spacing={3}>
                    {activeStep === 0 &&
                        <Fragment>
                            <PersonalDetailsForm handleChange={handleChange} fields={fields} />

                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <NavButton text={"Next"} handler={handleNext}/>
                            </Grid>
                        </Fragment>
                    }
                    {activeStep === 1 && (
                        <Fragment>
                            <LoginDetailsForm handleChange={handleChange} fields={fields} />

                            <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <NavButton text={"Back"} handler={handleBack}/>
                            </Grid>
                            <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <SubmitButton />
                            </Grid>
                        </Fragment>
                    )}
                    {activeStep === 2 && (
                        <EmailConfirmation details={successInfo} />
                    )}
                </Grid>
            </Box>

            <SnackbarAlert
                openSnackbarAlert={openErrorAlert}
                handleClose={() => setOpenErrorAlert(false)}
                isError={true}
                title={errorTitle}
                msg={errorMsg}
            />
        </RegisterLayout>
    );
}

export function NavButton({text, handler}) {
    return(
        <Button
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handler}
        >
            {text}
        </Button>
    );
}

export function SubmitButton() {
    return(
        <Button
            type="submit"
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
        >
            Finish
        </Button>
    );
}
