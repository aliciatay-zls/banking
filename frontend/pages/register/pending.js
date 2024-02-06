import { parse } from "cookie";
import Grid from '@mui/material/Grid';
import Typography from "@mui/material/Typography";

import RegisterLayout from "../../components/RegisterLayout";
import ResendEmailButton from "../../components/ResendEmailButton";
import { checkIsLoggedIn } from "../../src/authUtils";

export async function getServerSideProps(context) {
    const [isLoggedIn, ] = checkIsLoggedIn(context);
    const { req } = context;
    const rawCookies = req?.headers?.cookie || '';
    const cookies = parse(rawCookies);
    const tempToken = cookies?.temporary_token || '';

    if (isLoggedIn || tempToken === '') { //landed by accident or no token received
        return {
            redirect: {
                destination: `/login?errorMessage=${encodeURIComponent("Please login.")}`,
            }
        };
    }

    return {
        props: {
            tempToken: tempToken,
        },
    };
}

export default function PendingConfirmationPage(props) {
    return (
        <RegisterLayout
            isForm={false}
            tabTitle="Pending Confirmation"
            headerTitle="Your registration is almost complete."
        >
            <Grid item xs={12} align="center" sx={{mt: 5}}>
                <Typography component="p" variant="body1">
                    Please check your email for the confirmation link.
                </Typography>
                <Typography component="p" variant="body1">
                    If you did not receive it, click the button below.
                </Typography>
                <ResendEmailButton requestType={"UsingToken"} identifier={props.tempToken} />
            </Grid>
        </RegisterLayout>
    );
}
