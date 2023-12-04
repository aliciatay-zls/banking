import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import ErrorIcon from '@mui/icons-material/Error';

import DefaultLayout from "../../components/defaultLayout";

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
                router.replace('/login');
                return;
            }

            const newTokenRequest = {
                method: "POST",
                body: JSON.stringify({"access_token": accessToken, "refresh_token": refreshToken}),
            };

            const tryRefresh = async () => {
                const response = await fetch("http://127.0.0.1:8181/auth/refresh", newTokenRequest);
                const data = await response.json();

                //refresh failed
                if (!response.ok) {
                    const errorMessage = data?.message || '';
                    if (errorMessage === "expired or invalid refresh token") {
                        removeCookie('access_token', {
                            path: '/',
                            sameSite: 'strict',
                        });
                        removeCookie('refresh_token', {
                            path: '/',
                            sameSite: 'strict',
                        });
                        setTimeout(() => router.replace('/login'), 5000);
                        throw new Error("Session expired or invalid, please login again. Redirecting...");
                    } else {
                        setTimeout(() => router.replace('/500'), 5000);
                        throw new Error(serverSideErrorDefaultMessage);
                    }
                }

                if (!data || !("new_access_token" in data) || data.new_access_token === "") {
                    console.log("No token in response, cannot continue");
                    setTimeout(() => router.replace('/500'), 5000);
                    throw new Error(serverSideErrorDefaultMessage);
                }

                //refresh succeeded, update token on client side
                setCookie('access_token', data.new_access_token, {
                    path: '/',
                    maxAge: 60 * 60,
                    sameSite: 'strict',
                });
            };

            tryRefresh()
            .then(() => { //success case: go back to caller page
                if (props.isFromLogin === "true") { //caller was login page
                    return router.replace('/login');
                }
                if (props.callbackURL === '') {
                    console.log("Refresh successful but no callback url");
                    throw new Error(clientSideErrorDefaultMessage);
                }
                return router.replace(props.callbackURL);
            })
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
