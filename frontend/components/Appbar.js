import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import { useCookies } from 'react-cookie';
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
import { getRole } from "../src/authUtils";

export function BaseAppBar({homepagePath = "/login", innerChildren, outerChildren}) {
    return (
        <div>
            <Box className="appbar__box">
                <AppBar className="appbar--bgd" position="static">
                    <Toolbar>
                        <Tooltip title="Home">
                            <Link href={homepagePath}>
                                <Button>
                                    <Image src="/logo.png" alt="app logo" priority={true} height="60" width="200"/>
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

export function DefaultAppBar({homepage}) {
    const router = useRouter();

    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);
    const [openErrorAlert, setOpenErrorAlert] = useState(false);
    const { setDataToDisplay } = useContext(DataToDisplayContext);
    const [cookies, , removeCookie] = useCookies(['access_token', 'refresh_token']);
    const refreshToken = cookies?.refresh_token || '';

    async function handleLogout(event) {
        event.preventDefault();

        try {
            const request = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "refresh_token": refreshToken }),
            };

            const response = await fetch("https://127.0.0.1:8181/auth/logout", request);
            const data = await response.json();

            if (!response.ok) {
                showError("HTTP error during logout: " + (data?.message || ''));
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
            showError(err);
        }
    }

    function showError(err) {
        console.log(err);
        setOpenErrorAlert(true);
    }

    function handleOpenMenu(event) {
        setAnchorEl(event.currentTarget);
    }

    function handleCloseMenu() {
        setAnchorEl(null);
    }

    function handleNavigateHomepage() {
        router.replace(homepage);
    }

    function handleNavigateAccount() {
        router.replace(`${homepage}/account`);
    }

    return (
        <div>
            <BaseAppBar
                homepagePath={homepage}
                innerChildren={
                    <Tooltip title="Menu">
                        <IconButton
                            className="appbar__menu-button"
                            onClick={handleOpenMenu}
                            size="large"
                            edge="end"
                            color="inherit"
                            aria-label="menu"
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
                        { getRole(homepage) === 'user' &&
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
                msg={<span>Please try again later or <Button className="button--link" onClick={() => {
                    setOpenErrorAlert(false);
                    router.replace('/login');
                }}>login again.</Button></span>}
            />
        </div>
    );
}
