import { Fragment, useState } from "react";
import Alert from "@mui/material/Alert";
import Checkbox from "@mui/material/Checkbox";
import FormControl from '@mui/material/FormControl';
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function LoginDetailsForm({handleChange, fields}) {
    const [showPassword, setShowPassword] = useState(false);

    function handleClickShowPassword() {
        setShowPassword(!showPassword);
    }

    function handleMouseDownPassword(event) {
        event.preventDefault();
    }

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
                <FormControl
                    required
                    variant="outlined"
                    fullWidth
                    size="small"
                >
                    <InputLabel htmlFor="register-password">Password</InputLabel>
                    <OutlinedInput
                        type={showPassword ? 'text' : 'password'}
                        id="register-password"
                        name="password"
                        label="Password"
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                >
                                    {showPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                        }
                        value={fields.password}
                        onChange={e => handleChange(e)}
                    />
                </FormControl>
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
