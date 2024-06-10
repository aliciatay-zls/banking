import { Fragment } from "react";
import Alert from "@mui/material/Alert";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import PasswordField from "./PasswordField";

export default function RegistrationLoginDetailsForm({handleChange, fields}) {
    return (
        <Fragment>
            <Grid className="alert--notice" container direction="column">
                <Grid item>
                    <Alert severity="info">
                        <Typography className="typography--notice-title" variant="subtitle2">
                            Username requirements:
                        </Typography>
                        <Typography className="typography--notice-content" component="div" variant="caption">
                            <ul>
                                <li>Must be 6 to 20 characters long</li>
                                <li>Begins with an alphabet</li>
                                <li>Only alphabets and underscore allowed</li>
                            </ul>
                        </Typography>
                    </Alert>
                </Grid>
                <Grid item>
                    <Alert severity="info">
                        <Typography className="typography--notice-title" variant="subtitle2">
                            Password requirements:
                        </Typography>
                        <Typography className="typography--notice-content" component="div" variant="caption">
                            <ul>
                                <li>12 to 64 characters long</li>
                                <li>At least 1 digit</li>
                                <li>At least 1 uppercase letter</li>
                                <li>At least 1 lowercase letter</li>
                                <li>At least 1 special character (!, @, #, $, etc)</li>
                            </ul>
                        </Typography>
                    </Alert>
                </Grid>
                </Grid>
            <Grid item xs={12}>
                <TextField
                    required
                    id="register-username"
                    name="username"
                    label="Username"
                    autoComplete="username"
                    fullWidth
                    size="small"
                    autoFocus
                    inputProps={{ maxLength: 20 }}
                    value={fields.username}
                    onChange={e => handleChange(e)}
                />
            </Grid>
            <Grid item xs={12}>
                <PasswordField id={"register-initial-password"} isLoginPage={false} val={fields.password} handler={handleChange} />
            </Grid>
            <Grid item xs={12}>
                <PasswordField id={"register-confirm-password"} isLoginPage={false} name="confirmPassword" label="Confirm Password" val={fields.confirmPassword} handler={handleChange} />
            </Grid>
            <Grid item xs={12}>
                <FormControlLabel
                    required
                    control={
                        <Checkbox
                            id="register-tc"
                            name="tcCheckbox"
                            color="primary"
                            checked={fields.tcCheckbox}
                            onChange={e => handleChange(e)}
                        />
                    }
                    label="By signing up, I agree to the terms and conditions set out by BANK."
                />
            </Grid>
        </Fragment>
    );
}
