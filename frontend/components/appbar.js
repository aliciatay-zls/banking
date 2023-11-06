import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import { useCookies } from 'react-cookie';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Logout from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';

import { DataToDisplayContext, LoggedInContext } from "../pages/_app";

export function BaseAppBar({innerChildren, outerChildren}) {
    return (
        <div>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static" style={{ background: '#85011e' }}>
                    <Toolbar>
                        <Box
                            component="img"
                            src="/logo.png"
                            alt="app logo"
                            sx={{height: 60}}
                        />

                        {innerChildren}
                    </Toolbar>
                </AppBar>
            </Box>

            {outerChildren}
        </div>
    );
}

export function DefaultAppBar() {
    const router = useRouter();
    const customerID = router.query?.id || '';

    const { currentLoggedIn, setCurrentLoggedIn } = useContext(LoggedInContext);
    const clientRole = currentLoggedIn.role || '';
    console.log("appbar clientRole: " + clientRole);

    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);
    const [openErrorAlert, setOpenErrorAlert] = useState(false);
    const { setDataToDisplay } = useContext(DataToDisplayContext);
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
            setCurrentLoggedIn({});

            setDataToDisplay(["Logout successful"]);
            await router.replace('/login');

        } catch (err) {
            console.log(err);
            setOpenErrorAlert(true);
        }
    }

    function handleOpenMenu(event) {
        setAnchorEl(event.currentTarget);
    }

    function handleCloseMenu() {
        setAnchorEl(null);
    }

    function handleNavigateHomepage() {
        if (customerID !== '') {
            router.replace('/customers'.concat('/', customerID));
        }
    }

    function handleNavigateAccount() {
        if (customerID !== '') {
            router.replace('/customers'.concat('/', customerID, '/account'));
        }
    }

    return (
        <div>
            <BaseAppBar
                innerChildren={
                    <Tooltip title="Menu">
                        <IconButton
                            onClick={handleOpenMenu}
                            size="large"
                            edge="end"
                            style={{marginLeft: "auto"}}
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Tooltip>
                }
                outerChildren={
                    <Menu
                        id="appbar-menu"
                        anchorEl={anchorEl}
                        open={openMenu}
                        onClose={handleCloseMenu}
                        MenuListProps={{
                            'aria-labelledby': 'basic-button',
                        }}
                    >
                        { clientRole === 'user' &&
                            <div>
                                <MenuItem onClick={handleNavigateHomepage}>My Profile</MenuItem>
                                <MenuItem onClick={handleNavigateAccount}>My Accounts</MenuItem>
                                <Divider/>
                            </div>
                        }
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <Logout fontSize="small" />
                            </ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                }
            />

            { openErrorAlert &&
                <Alert
                    onClose={() => {
                        setOpenErrorAlert(false);
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
