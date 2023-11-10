import Head from "next/head";
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from "@mui/material/Typography";

import { BaseAppBar } from "./appbar";
import BankFooter from "./footer";

export default function LoginLayout({ children }) {
    return (
        <div>
            <Head>
                <title>Banking App - Login</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <BaseAppBar/>

            <Grid container component="main" sx={{ height: '100vh' }}>
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        backgroundImage: 'url(https://source.unsplash.com/random?wallpapers)',
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: (t) =>
                            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={0} square>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant="h3" align="center" marginTop={5} marginBottom={3}>
                            Welcome back
                        </Typography>
                        <Typography component="h1" variant="h5">
                            Sign in
                        </Typography>
                        {children}
                    </Box>
                </Grid>
            </Grid>

            <BankFooter/>
        </div>
    );
}
