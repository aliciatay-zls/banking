import { Fragment, useState } from "react";
import Checkbox from "@mui/material/Checkbox";
import FormControl from '@mui/material/FormControl';
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import TextField from "@mui/material/TextField";
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
