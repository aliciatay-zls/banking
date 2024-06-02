import '../styles/global.css';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from "@mui/material/Typography";

import { BaseAppBar } from "./Appbar";
import BankFooter from "./Footer";
import BankHead from "./Head";

export default function RegisterLayout({ isForm = true, tabTitle, headerTitle, children }) {
    return (
        <div>
            <BankHead title={tabTitle} />

            <BaseAppBar />

            <Container component="main" maxWidth={isForm ? "xs" : ""}>
                <Box className="register__box">
                    <Typography component="div" variant="h4" align="center">
                        {headerTitle}
                    </Typography>

                    {children}
                </Box>
            </Container>

            <BankFooter />
        </div>
    );
}
