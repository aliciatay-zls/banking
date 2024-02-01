import Link from "next/link";
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { useCookies} from "react-cookie";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { DataToDisplayContext } from "../_app";
import LoginLayout from "../../components/LoginLayout";
import PasswordField from "../../components/PasswordField";
import SnackbarAlert from "../../components/SnackbarAlert";
import * as utils from "../../src/authUtils";

export async function getServerSideProps(context) {
    const [isLoggedIn, accessToken, refreshToken] = utils.checkIsLoggedIn(context);

    //not logged in or failed to refresh, proceed to render form to make client log in again
    if (!isLoggedIn) {
        return {
            props: {},
        };
    }

    const request = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "access_token": accessToken, "refresh_token": refreshToken }),
    };
    let data = '';

    try {
        const response = await fetch("https://127.0.0.1:8181/auth/continue", request);
        if (response.headers.get("Content-Type") !== "application/json") {
            throw new Error("Response is not json");
        }

        data = await response.json();

        const errorMessage = data?.message || '';
        const homepage = data?.homepage || '';

        //already logged in, redirect to respective homepage
        if (response.ok) {
            return {
                redirect: {
                    destination: homepage,
                    permanent: true,
                }
            };
        }

        if (response.status === 401 && errorMessage === "expired access token") { //NewAuthenticationErrorDueToExpiredAccessToken
            console.log("Redirecting to refresh");
            return {
                redirect: {
                    destination: `/login/refresh?isFromLogin=${encodeURIComponent(true)}`,
                    permanent: true,
                },
            };
        }
        if (errorMessage !== '') {
            console.log("Error while checking if already logged in: " + errorMessage);
        }

        return {
            props: {},
        };

    } catch (err) {
        console.log(err);
        return {
            redirect: {
                destination: '/500',
                permanent: false,
            }
        };
    }
}

export default function LoginPage() {
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const { dataToDisplay, setDataToDisplay } = useContext(DataToDisplayContext);
    const [snackbarMsg, setSnackbarMsg] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [, setCookie, ] = useCookies(['access_token', 'refresh_token']);

    useEffect(() => {
        if (dataToDisplay.pageData?.length === 1) {
            setSnackbarMsg(dataToDisplay.pageData[0]);
            setOpenSnackbar(true);
        } else if (router.query.errorMessage && router.query.errorMessage !== '') {
            setIsError(true);
            setSnackbarMsg(router.query.errorMessage);
            setOpenSnackbar(true);
        }
    }, [router.query.errorMessage]); //run after initial render and each time value of this query param changes

    function handleSetPassword(event) {
        setPassword(event.target.value);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setIsLoading(true);

        const request = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "username": username, "password": password }),
        };

        try {
            const response = await fetch("https://127.0.0.1:8181/auth/login", request);
            const data = await response.json();

            const errorMessage = data?.message || '';
            const isPendingConfirmation = data?.is_pending || false;
            const accessToken = data?.access_token || '';
            const refreshToken = data?.refresh_token || '';
            const homepage = data?.homepage || '';

            //login unsuccessful
            if (!response.ok) {
                throw new Error("HTTP error during login: " + errorMessage);
            }

            if (accessToken === '') {
                throw new Error("No access token in response, cannot continue");
            }

            //200 ok but cannot log in yet
            if (isPendingConfirmation === true) {
                setCookie('temporary_token', accessToken, {
                    path: '/',
                    maxAge: 60 * 60, //1 hour
                    secure: true,
                    sameSite: 'strict',
                });
                return router.replace('/register/pending');
            }

            //200 ok and logged in, store tokens on client side as cookies
            if (refreshToken === '' || homepage === '') {
                throw new Error("No refresh token or homepage in response, cannot continue");
            }
            setCookie('access_token', accessToken, {
                path: '/', //want cookie to be accessible on all pages
                maxAge: 60 * 60, //1 hour
                secure: true, //transmit via HTTPS
                sameSite: 'strict',
            });
            setCookie('refresh_token', refreshToken, {
                path: '/',
                maxAge: 60 * 60,
                secure: true,
                sameSite: 'strict',
            });

            return router.replace(homepage);

        } catch (err) {
            setIsError(true);
            setSnackbarMsg(err.message);
            setOpenSnackbar(true);
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <LoginLayout>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <TextField
                    required
                    id="login-username"
                    name="username"
                    label="Username"
                    autoComplete="name"
                    margin="normal"
                    fullWidth
                    size="small"
                    autoFocus
                    inputProps={{ maxLength: 20 }}
                    value={username}
                    onChange={(u) => setUsername(u.target.value)}
                />
                <PasswordField id={"login-password"} val={password} handler={handleSetPassword} />
                <Button type="submit" fullWidth variant="contained bank-theme" sx={{ mt: 2, mb: 2 }}>
                    {isLoading ? 'Loading...' : 'Login'}
                </Button>
                <Grid item align="right">
                    <Typography variant="body2">
                        Don't have an account? <Link href={'/register'}>Sign up now</Link>
                    </Typography>
                </Grid>
            </Box>

            <SnackbarAlert
                openSnackbarAlert={openSnackbar}
                handleClose={() => {
                    setIsError(false);
                    setOpenSnackbar(false);
                    setDataToDisplay({
                        isLoggingOut: false,
                        pageData: [],
                    }); //clear data
                }}
                isError={isError}
                title={snackbarMsg}
            />

        </LoginLayout>
    );
}
