import Box from '@mui/material/Box';
import Typography from "@mui/material/Typography";

import DefaultLayout from "../components/defaultLayout";

export default function Custom500() {
    return (
        <DefaultLayout
            isPossibleTOB={false}
            tabTitle={"Error"}
        >
            <Box height="100vh">
                <Typography variant="h1" align="center">
                    500 Server Error
                </Typography>
                <Box sx={{mt: 3, display: 'flex', justifyContent: 'center', flexWrap: 'wrap'}}>
                    <Typography variant="body1">
                        We apologise, something went wrong on our end.
                        <br/>
                        Please try again later or contact us if the issue persists.
                    </Typography>
                </Box>
            </Box>
        </DefaultLayout>
    );
}
