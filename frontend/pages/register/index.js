import { Fragment, useState } from "react";
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
import SnackbarAlert from "../../components/snackbar";

const steps = ['Personal Details', 'Login Details', 'Email Confirmation'];
const formFields = [
    {id: "register-first-name", value: ""},
    {id: "register-last-name", value: ""},
    {id: "register-email", value: ""},
    {id: "register-dob", value: ""},
    {id: "register-city", value: ""},
    {id: "register-zip", value: ""},
    {id: "register-username", value: ""},
    {id: "register-password", value: ""},
    {id: "register-tc", value: false}
];

export default function RegistrationPage() {
    const [activeStep, setActiveStep] = useState(0);
    const [fields, setFields] = useState(formFields);
    const [errorMsg, setErrorMsg] = useState('');
    const [openErrorAlert, setOpenErrorAlert] = useState(false);
    const [successInfo, setSuccessInfo] = useState({});

    //record field value whenever it changes
    function handleChange(field) {
        setFields(
            fields.map((existing) => {
                if (existing.id === field.id) {
                    existing.value = (field.id === "register-tc" ? field.checked : field.value);
                }
                return existing;
            })
        );
    }

    function getFieldValue(id) {
        return fields.find(f => f.id === id).value;
    }

    function handleNext() {
        //TODO: frontend validation
        setActiveStep(activeStep + 1);
    }

    function handleBack() {
        setActiveStep(activeStep - 1);
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const request = {
            method: "POST",
            body: JSON.stringify({
                name: getFieldValue("register-first-name").concat(" ", getFieldValue("register-last-name")),
                city: getFieldValue("register-city"),
                zipcode: getFieldValue("register-zip"),
                date_of_birth: getFieldValue("register-dob"),
                email: getFieldValue("register-email"),
                username: getFieldValue("register-username"),
                password: getFieldValue("register-password"),
            }),
        };

        try {
            const response = await fetch("http://127.0.0.1:8181/auth/register", request);
            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data?.message || '';
                console.log("HTTP error during registration")
                throw new Error(errorMessage);
            }

            setSuccessInfo(data);
            setActiveStep(2);

        } catch (err) {
            console.log(err);
            setErrorMsg(err.message)
            setOpenErrorAlert(true);
        }
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
                <Grid container spacing={2}>
                    {activeStep === 0 &&
                        <Fragment>
                            <PersonalDetailsForm handleChange={handleChange} getValue={getFieldValue} />

                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <NavButton text={"Next"} handler={handleNext}/>
                            </Grid>
                        </Fragment>
                    }
                    {activeStep === 1 && (
                        <Fragment>
                            <LoginDetailsForm handleChange={handleChange} getValue={getFieldValue} />

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
                title={"Registration failed"}
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
