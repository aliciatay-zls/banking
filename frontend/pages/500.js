import '../styles/global.css';

import Box from '@mui/material/Box';
import Typography from "@mui/material/Typography";

import BankHead from "../components/Head";

export default function Custom500() {
    return (
        <Box className="page-500__box" height="100vh">
            <BankHead title="Error"/>
            <Typography variant="h2" align="center">
                500 Server Error
            </Typography>
            <Box className="page-500__message">
                <Typography variant="body1" align="center">
                    We apologise, something went wrong on our end.
                    <br/><br/>
                    Please try again later or contact us if the issue persists.
                </Typography>
            </Box>
        </Box>
    );
}
