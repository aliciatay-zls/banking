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
                <Box
                    sx={{
                        marginTop: 5,
                        marginBottom: 5,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minHeight: "500px",
                    }}
                >
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
