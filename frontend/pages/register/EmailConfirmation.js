import { Fragment } from "react";
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

export default function EmailConfirmation({details}) {
    return(
        <Fragment>
            <Grid item xs={12}>
                <Typography component="p" variant="caption" align="center">
                    Time completed: {details.requested_on}
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
        </Fragment>
    );
}
