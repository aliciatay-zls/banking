import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

import { DefaultAppBar } from "./Appbar";
import BankFooter from "./Footer";
import BankHead from "./Head";
import {getRole} from "../src/authUtils";

export default function DefaultLayout({ homepage, isPossibleTOB = true, tabTitle, headerTitle, children }) {
    const isTOB = isPossibleTOB && (getRole(homepage) === 'admin');

    return (
        <div>
            <BankHead title={tabTitle}/>

            <DefaultAppBar homepage={homepage}/>

            { isTOB &&
                <Alert severity="info">
                    <Typography variant="body1">
                        You are acting on behalf of this customer.
                    </Typography>
                </Alert>
            }

            <Typography variant="h4" align="center" fontWeight="600" marginTop={5} marginBottom={3}>
                {headerTitle}
            </Typography>

            {children}

            <BankFooter/>
        </div>
    );
}
