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
import PersonalDetailsForm from "./PersonalDetailsForm";
import RegisterLayout from "../../components/RegisterLayout";
import SnackbarAlert from "../../components/SnackbarAlert";
import * as f from "../../src/formatUtils";
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
const errorDefaultMessage = "Registration failed";

export function getServerSideProps() {
    return {
        props: {
            authServerAddress: process.env.AUTH_SERVER_ADDRESS,
        },
    };
}

export default function RegistrationPage(props) {
    const [activeStep, setActiveStep] = useState(0);
    const [fields, setFields] = useState({
        firstName: "",
        lastName: "",
        email: "",
        dob: "",
        country: "SG",
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
            newValue = f.capitalize(value);
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

        if (!isFieldsFilledAndAscii(activeStep) || !validatePersonalDetails()) {
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
        if (!isFieldsFilledAndAscii(activeStep - 1) || !validatePersonalDetails()) {
            return;
        }
        //do checks for current form
        if (!isFieldsFilledAndAscii(activeStep) || !validateLoginDetails()) {
            return;
        }

        const request = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "first_name": f.removeSpaces(fields.firstName),
                "last_name": f.removeSpaces(fields.lastName),
                "country": f.removeSpaces(fields.country),
                "zipcode": f.removeSpaces(fields.zipcode),
                "date_of_birth": f.removeSpaces(fields.dob),
                "email": f.removeSpaces(fields.email),
                "username": f.removeSpaces(fields.username),
                "password": f.removeSpaces(fields.password),
            }),
        };

        try {
            const response = await fetch(`https://${props.authServerAddress}/auth/register`, request);
            const data = await response.json();

            if (!response.ok) {
                const responseErrMsg = data?.message || '';
                console.log("HTTP error during registration: "+ responseErrMsg);

                if (response.status === 409 || response.status === 422 || response.status === 429) { //Email or username already taken, validation error, rate limiting exceeded
                    setErrorMsg(responseErrMsg);
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

    function isFieldsFilledAndAscii(step) {
        const fieldNames = stepFieldNames[step];
        for (let i=0; i<fieldNames.length; i++) {
            const val = fields[fieldNames[i]];
            if (val.length === 0 || f.removeSpaces(val).length === 0) {
                openValidationErrorAlert("Please check that all fields are filled.");
                return false;
            }
            if (!isAscii(val)) {
                openValidationErrorAlert("Please ensure that none of the fields contain non-English characters.");
                return false;
            }
        }
        return true;
    }

    function validatePersonalDetails() {
        if (!v.validateName(fields.firstName, fields.lastName)) {
            openValidationErrorAlert("Please check that the First and Last Names are correct.");
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
        if (!v.validateCountry(fields.country)) {
            openValidationErrorAlert("Please check that the Country selected is correct.");
            return false;
        }
        if (!v.validateZipcode(fields.zipcode, fields.country)) {
            openValidationErrorAlert("Please check that the Postal/Zip Code entered is correct.");
            return false;
        }

        return true;
    }

    function validateLoginDetails() {
        if (!v.validateNewUsername(fields.username)) {
            openValidationErrorAlert("Please check that the Username meets the requirements.");
            return false;
        }
        if (!v.validateNewPassword(fields.password)) {
            openValidationErrorAlert("Please check that the Password meets the requirements.");
            return false;
        }
        if (fields.password !== fields.confirmPassword) {
            openValidationErrorAlert("Passwords do not match.");
            return false;
        }
        if (!fields.tcCheckbox) {
            openValidationErrorAlert("Please review and accept the terms and conditions.");
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
            <Stepper className="register__stepper" activeStep={activeStep}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Box className="form" component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    {activeStep === 0 &&
                        <Fragment>
                            <PersonalDetailsForm handleChange={handleChange} fields={fields} />

                            <Grid className="button--grid right" item xs={12}>
                                <NavButton text={"Next"} handler={handleNext}/>
                            </Grid>
                        </Fragment>
                    }
                    {activeStep === 1 && (
                        <Fragment>
                            <LoginDetailsForm handleChange={handleChange} fields={fields} />

                            <Grid className="button--grid left" item xs={6}>
                                <NavButton text={"Back"} handler={handleBack}/>
                            </Grid>
                            <Grid className="button--grid right" item xs={6}>
                                <SubmitButton />
                            </Grid>
                        </Fragment>
                    )}
                    {activeStep === 2 && (
                        <EmailConfirmation details={successInfo} authServerAddress={props.authServerAddress} />
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
            className="button"
            variant="contained"
            onClick={handler}
        >
            {text}
        </Button>
    );
}

export function SubmitButton() {
    return(
        <Button
            className="button"
            variant="contained"
            type="submit"
        >
            Finish
        </Button>
    );
}
