import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useCookies } from 'react-cookie';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';

export default function ButtonAppBar() {
    const router = useRouter();
    const [openErrorAlert, setOpenErrorAlert] = useState(false);
    const [cookies, setCookie, removeCookie] = useCookies(['access_token', 'refresh_token']);
    const refreshToken = cookies?.refresh_token || '';

    async function handleLogout(event) {
        event.preventDefault();

        const request = {
            method: "POST",
            body: JSON.stringify({refresh_token: refreshToken}),
        };

        try {
            const response = await fetch("http://127.0.0.1:8181/auth/logout", request);
            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data?.message || '';
                throw new Error("HTTP error during logout: " + errorMessage);
            }

            removeCookie('access_token', {
                path: '/',
                sameSite: 'strict',
            });
            removeCookie('refresh_token', {
                path: '/',
                sameSite: 'strict',
            });

            await router.replace('/login');

        } catch (err) {
            console.log(err);
            setOpenErrorAlert(true);
        }
    }

    return (
        <div>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Menu
                        </Typography>
                        <Button type="button" color="inherit" onClick={handleLogout}>Logout</Button>
                    </Toolbar>
                </AppBar>
            </Box>

            { openErrorAlert &&
                <Alert
                    onClose={() => {
                        setOpenErrorAlert(false)
                    }}
                    severity="error"
                >
                    <AlertTitle>Logout failed</AlertTitle>
                    Please try again later or <Link href={"/login"}>login again.</Link>
                </Alert>
            }
        </div>
    );
}
