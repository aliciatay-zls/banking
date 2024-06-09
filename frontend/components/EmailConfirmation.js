import { Fragment } from "react";
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import ResendEmailButton from "./ResendEmailButton";
import { getLocalTime } from "../src/formatUtils";

export default function EmailConfirmation({details, authServerAddress}) {
    return(
        <Fragment>
            <Grid item xs={12}>
                <Typography component="p" variant="caption" align="center">
                    Time completed: {getLocalTime(details.created_on)}
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography component="p" variant="body1" align="center">
                    Confirm your email address by clicking the link sent to:
                </Typography>
                <Typography component="p" variant="body1" align="center" fontWeight="fontWeightMedium">
                    {details.email}
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography component="p" variant="body1" align="center">
                    Please note that the link will expire in 1 hour.
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography component="p" variant="body1" align="center">
                    If you did not receive it, check the junk/spam folder or request for a new one:
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <ResendEmailButton requestType={"UsingEmail"} identifier={details.email} authServerAddress={authServerAddress} />
            </Grid>
        </Fragment>
    );
}
