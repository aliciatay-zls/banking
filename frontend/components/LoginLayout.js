import '../styles/global.css';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from "@mui/material/Typography";

import { BaseAppBar } from "./Appbar";
import BankFooter from "./Footer";
import BankHead from "./Head";

export default function LoginLayout({ children }) {
    return (
        <div>
            <BankHead title="Login"/>

            <BaseAppBar/>

            <Grid className="login__container" container component="main">
                <Grid className="login__decoration" item xs={false} sm={4} md={7}/>
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={0} square>
                    <Box className="login__box">
                        <Typography className="text--bold" variant="h2" align="center" marginTop={5}>
                            Welcome Back
                        </Typography>
                        {children}
                    </Box>
                </Grid>
            </Grid>

            <BankFooter/>
        </div>
    );
}
