import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import isJWT from "validator/lib/isJWT";
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import ErrorIcon from '@mui/icons-material/Error';

import DefaultLayout from "../../components/DefaultLayout";

export function getServerSideProps(context) {
    return {
        props: {
            callbackURL: context.query.callbackURL || '',
            isFromLogin: context.query.isFromLogin || "false",
        }
    };
}

export default function TempRefreshPage(props) {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [cookies, setCookie, removeCookie] = useCookies(['access_token', 'refresh_token']);
    const serverSideErrorDefaultMessage = "Internal server error.";
    const clientSideErrorDefaultMessage = "Unexpected error occurred";

    useEffect(() => {
        let ignore = false;

        if (!ignore) {
            const accessToken = cookies?.access_token || '';
            const refreshToken = cookies?.refresh_token || '';
            if (accessToken === '' || refreshToken === '') {
                console.log("No token");
                router.replace('/login');
                return;
            }
            if (!isJWT(accessToken)|| !isJWT(refreshToken)) {
                console.log("Invalid token");
                router.replace('/login');
                return;
            }

            const newTokenRequest = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "access_token": accessToken, "refresh_token": refreshToken }),
            };

            const tryRefresh = async () => {
                const response = await fetch("https://127.0.0.1:8181/auth/refresh", newTokenRequest);
                const data = await response.json();

                const newAccessToken = data?.new_access_token || '';

                //refresh failed
                if (!response.ok) {
                    const errorMessage = data?.message || '';
                    console.log(errorMessage);
                    if (errorMessage === "access token not expired yet") {
                        router.replace(props.callbackURL === '' ? '/login' : props.callbackURL);
                        return;
                    } else if (errorMessage === "expired or invalid refresh token") {
                        removeCookie('access_token', {
                            path: '/',
                            secure: true,
                            sameSite: 'strict',
                        });
                        removeCookie('refresh_token', {
                            path: '/',
                            secure: true,
                            sameSite: 'strict',
                        });
                        setTimeout(() => router.replace('/login'), 5000);
                        throw new Error("Session expired or invalid, please login again. Redirecting...");
                    } else {
                        setTimeout(() => router.replace('/500'), 5000);
                        throw new Error(serverSideErrorDefaultMessage);
                    }
                }

                if (newAccessToken === '' || !isJWT(newAccessToken)) {
                    console.log("No token in response, cannot continue");
                    setTimeout(() => router.replace('/500'), 5000);
                    throw new Error(serverSideErrorDefaultMessage);
                }

                //refresh succeeded: update token on client side and go back to caller page
                setCookie('access_token', newAccessToken, {
                    path: '/',
                    maxAge: 60 * 60,
                    secure: true,
                    sameSite: 'strict',
                });

                if (props.isFromLogin === "true") { //caller was login page
                    router.replace('/login');
                    return;
                }
                if (props.callbackURL === '') { //no caller, for example landed here deliberately
                    console.log("Refresh successful but no callback url");
                    throw new Error(clientSideErrorDefaultMessage);
                }
                router.replace(props.callbackURL);
            };

            tryRefresh()
            .catch((err) => {
                setIsLoading(false);
                setError(err.message);
                console.log(err);
            });
        }

        return () => {
            ignore = true;
        };
    }, []);

    return (
        <DefaultLayout
            isPossibleTOB={false}
            tabTitle="Home"
        >
            <Box height="100vh" align="center">
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={isLoading}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>

                { error &&
                    <Typography variant="h5" style={{color: '#d32f2f'}}>
                        <ErrorIcon fontSize="inherit"/> {error}
                    </Typography>
                }
            </Box>
        </DefaultLayout>
    );
}
