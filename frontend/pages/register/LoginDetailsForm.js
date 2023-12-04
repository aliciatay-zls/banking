import { Fragment } from "react";
import Alert from "@mui/material/Alert";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import PasswordField from "../../components/PasswordField";

export default function LoginDetailsForm({handleChange, fields}) {
    return (
        <Fragment>
            <Alert
                severity="info"
                sx={{
                    justifyContent: 'center',
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'light'
                            ? theme.palette.grey[100]
                            : theme.palette.grey[900],
                }}
            >
                <Grid container direction="row">
                    <Grid item>
                        <Typography variant="subtitle2" sx={{mb: -1}}>
                            Username requirements:
                        </Typography>
                        <Typography component="div" variant="caption" sx={{ml: -3}}>
                            <ul>
                                <li>Minimum of 6 characters and maximum of 20 characters long</li>
                                <li>Begins with an alphabet</li>
                                <li>Only alphabets and underscore allowed</li>
                            </ul>
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="subtitle2" sx={{mb: -1}}>
                            Password requirements:
                        </Typography>
                        <Typography component="div" variant="caption" sx={{ml: -3}}>
                            <ul>
                                <li>Minimum of 12 characters long</li>
                                <li>At least 1 digit</li>
                                <li>At least 1 uppercase letter</li>
                                <li>At least 1 lowercase letter</li>
                                <li>At least 1 special character (!, @, #, $, etc)</li>
                            </ul>
                        </Typography>
                    </Grid>
                </Grid>
            </Alert>
            <Grid item xs={12}>
                <TextField
                    required
                    id="register-username"
                    name="username"
                    label="Username"
                    autoComplete="off"
                    fullWidth
                    size="small"
                    autoFocus
                    value={fields.username}
                    onChange={e => handleChange(e)}
                />
            </Grid>
            <Grid item xs={12}>
                <PasswordField id={"register-initial-password"} val={fields.password} handler={handleChange} />
            </Grid>
            <Grid item xs={12}>
                <PasswordField id={"register-confirm-password"} name="confirmPassword" label="Confirm Password" val={fields.confirmPassword} handler={handleChange} />
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
