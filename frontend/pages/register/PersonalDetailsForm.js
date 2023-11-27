import { Fragment } from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";

export default function PersonalDetailsForm({handleChange, getValue}) {
    return (
        <Fragment>
            <Grid item xs={12} sm={6}>
                <TextField
                    required
                    id="register-first-name"
                    name="firstName"
                    label="First Name"
                    autoComplete="given-name"
                    fullWidth
                    size="small"
                    autoFocus
                    value={getValue("register-first-name")}
                    onChange={e => handleChange(e.target)}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    required
                    id="register-last-name"
                    name="lastName"
                    label="Last Name"
                    autoComplete="family-name"
                    fullWidth
                    size="small"
                    value={getValue("register-last-name")}
                    onChange={e => handleChange(e.target)}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    required
                    id="register-email"
                    name="email"
                    label="Email Address"
                    autoComplete="email"
                    fullWidth
                    size="small"
                    value={getValue("register-email")}
                    onChange={e => handleChange(e.target)}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    required
                    id="register-dob"
                    name="dob"
                    label="Date of Birth"
                    autoComplete="off"
                    fullWidth
                    size="small"
                    value={getValue("register-dob")}
                    onChange={e => handleChange(e.target)}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    required
                    id="register-city"
                    name="city"
                    label="City"
                    autoComplete="off"
                    fullWidth
                    size="small"
                    value={getValue("register-city")}
                    onChange={e => handleChange(e.target)}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    required
                    id="register-zip"
                    name="zipcode"
                    label="Zip Code"
                    autoComplete="off"
                    fullWidth
                    size="small"
                    value={getValue("register-zip")}
                    onChange={e => handleChange(e.target)}
                />
            </Grid>
        </Fragment>
    );
}
