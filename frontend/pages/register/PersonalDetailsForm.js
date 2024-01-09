import { Fragment } from "react";
import FormControl from '@mui/material/FormControl';
import Grid from "@mui/material/Grid";
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from "@mui/material/TextField";

import { Countries } from "../../src/countries";

export default function PersonalDetailsForm({handleChange, fields}) {
    return (
        <Fragment>
            <Grid item xs={12} sm={6}>
                <TextField
                    required
                    id="register-first-name"
                    name="firstName"
                    label="First Name"
                    autoComplete="given-name"
                    autoCapitalize="words"
                    fullWidth
                    size="small"
                    autoFocus
                    value={fields.firstName}
                    onChange={e => handleChange(e)}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    required
                    id="register-last-name"
                    name="lastName"
                    label="Last Name"
                    autoComplete="family-name"
                    autoCapitalize="words"
                    fullWidth
                    size="small"
                    value={fields.lastName}
                    onChange={e => handleChange(e)}
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
                    value={fields.email}
                    onChange={e => handleChange(e)}
                />
            </Grid>
            <Grid item xs={12}>
                <InputLabel htmlFor="register-dob">Date of Birth</InputLabel>
                <FormControl fullWidth>
                    <Input
                        required
                        type="date"
                        id="register-dob"
                        name="dob"
                        autoComplete="off"
                        pattern="\d{4}-\d{2}-\d{2}"
                        min="1923-01-01"
                        value={fields.dob}
                        onChange={e => handleChange(e)}
                    >
                    </Input>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    <InputLabel htmlFor="register-country">Country</InputLabel>
                        <Select
                            required
                            id="register-country"
                            name="country"
                            label="Country"
                            autoComplete="off"
                            size="small"
                            value={fields.country}
                            onChange={e => handleChange(e)}
                        >
                            {Object.keys(Countries).sort().map((k) => (
                                <MenuItem key={Countries[k]} value={Countries[k]}>{k}</MenuItem>
                            ))}
                        </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    required
                    id="register-zip"
                    name="zipcode"
                    label="Postal/Zip Code"
                    autoComplete="off"
                    fullWidth
                    size="small"
                    value={fields.zipcode}
                    onChange={e => handleChange(e)}
                />
            </Grid>
        </Fragment>
    );
}
