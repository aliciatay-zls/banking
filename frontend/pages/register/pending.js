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
            authServerAddress: process.env.AUTH_SERVER_ADDRESS,
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
            <Grid className="pending__grid--spaced" item xs={12} align="center">
                <Typography component="p" variant="body1">
                    Please check your email for the confirmation link.
                </Typography>
                <Typography component="p" variant="body1">
                    If you did not receive it, click the button below.
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <ResendEmailButton requestType={"UsingToken"} identifier={props.tempToken} authServerAddress={props.authServerAddress} />
            </Grid>
        </RegisterLayout>
    );
}
