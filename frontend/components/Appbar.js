import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import { useCookies } from 'react-cookie';
import isJWT from "validator/lib/isJWT";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Logout from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';

import SnackbarAlert from "../components/SnackbarAlert";
import { DataToDisplayContext } from "../pages/_app";
import { getHomepagePath } from "../src/authUtils";

export function BaseAppBar({homepagePath = "/login", innerChildren, outerChildren}) {
    return (
        <div>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static" style={{ background: '#85011e' }}>
                    <Toolbar>
                        <Tooltip title="Home">
                            <Link href={homepagePath}>
                                <Button>
                                    <img src="/logo.png" alt="app logo" height="60"/>
                                </Button>
                            </Link>
                        </Tooltip>

                        {innerChildren}
                    </Toolbar>
                </AppBar>
            </Box>

            {outerChildren}
        </div>
    );
}

export function DefaultAppBar({clientInfo}) {
    const router = useRouter();
    const homepagePath = getHomepagePath(clientInfo) || "/login"; //default
    const clientRole = clientInfo?.role || '';
    const clientCustomerId = clientInfo?.cid || '';

    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);
    const [openErrorAlert, setOpenErrorAlert] = useState(false);
    const { setDataToDisplay } = useContext(DataToDisplayContext);
    const [cookies, , removeCookie] = useCookies(['access_token', 'refresh_token']);
    const refreshToken = cookies?.refresh_token || '';

    async function handleLogout(event) {
        event.preventDefault();

        try {
            if (!isJWT(refreshToken)) {
                throw new Error("Refresh token is not a valid JWT");
            }
            const request = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "refresh_token": refreshToken }),
            };

            const response = await fetch("https://127.0.0.1:8181/auth/logout", request);
            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data?.message || '';
                throw new Error("HTTP error during logout: " + errorMessage);
            }

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
            setDataToDisplay({
                isLoggingOut: true,
                pageData: ["Logout successful"],
            });

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
        router.replace(`/customers/${clientCustomerId}`);
    }

    function handleNavigateAccount() {
        router.replace(`/customers/${clientCustomerId}/account`);
    }

    return (
        <div>
            <BaseAppBar
                homepagePath={homepagePath}
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

            <SnackbarAlert
                openSnackbarAlert={openErrorAlert}
                handleClose={() => setOpenErrorAlert(false)}
                duration={null}
                isError={true}
                title="Logout failed"
                msg={<span>Please try again later or <Button sx={buttonAsLinkStyle} onClick={() => {
                    setOpenErrorAlert(false);
                    router.replace('/login');
                }}>login again.</Button></span>}
            />
        </div>
    );
}

const buttonAsLinkStyle = {
    p: 0,
    mb: 0.5,
    fontWeight: 'normal',
    textTransform: 'none',
    textDecoration: 'underline',
    '&:hover': {
        textDecoration: 'underline',
    },
};
