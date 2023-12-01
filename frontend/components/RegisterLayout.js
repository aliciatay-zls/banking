import Alert from "@mui/material/Alert";
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from "@mui/material/Typography";

import { BaseAppBar } from "./appbar";
import BankFooter from "./footer";
import BankHead from "./Head";

export default function RegisterLayout({ isForm = true, tabTitle, headerTitle, children }) {
    return (
        <div>
            <BankHead title={tabTitle} />

            <BaseAppBar />

            <Alert severity="info">
                <Grid container direction="row" justifyContent="space-evenly" >
                    <Grid item xs={6}>
                        <Typography variant="subtitle2"  sx={{mt: 2, ml: 2, mb: -1}}>
                            Username requirements:
                        </Typography>
                        <Typography component="div" variant="caption">
                            <ul>
                                <li>Minimum of 6 characters and maximum of 20 characters long</li>
                                <li>Begins with an alphabet</li>
                                <li>Only alphabets and underscore allowed</li>
                            </ul>
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="subtitle2" sx={{mt: 2, ml: 2, mb: -1}}>
                            Password requirements:
                        </Typography>
                        <Typography component="div" variant="caption">
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

            <Container component="main" maxWidth={isForm ? "xs" : ""}>
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minHeight: "500px",
                    }}
                >
                    <Typography component="h1" variant="h4" align="center">
                        {headerTitle}
                    </Typography>

                    {children}
                </Box>
            </Container>

            <BankFooter />
        </div>
    );
}
