import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from "@mui/material/Typography";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import DefaultLayout from "../../../components/defaultLayout";
import serverSideProps from "../../../src/serverSideProps";

export async function getServerSideProps(context) {
    return await serverSideProps(context);
}

const textFieldProps = {
    input: {
        readOnly: true,
        style: {
            fontWeight: '600',
        },
    },
    label: {
        style: {
            fontWeight: '600',
        },
    },
};

export default function CustomerHomePage(props) {
    return (
        <DefaultLayout
            clientInfo={props.clientInfo}
            tabTitle={"Home"}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    '& > :not(style)': {
                        m: 1,
                        height: 128,
                        width: 400,
                    },
                    marginBottom: 3,
                }}
            >
                <Paper
                    sx={{
                        my: { xs: 2, md: 2 },
                        p: { xs: 3, md: 5 },
                        minHeight: "500px",
                        display: "grid",
                    }}
                >
                    <Typography variant="h4" align="center" fontWeight="600">
                        Profile
                        <br/>
                        <AccountCircleIcon sx={{fontSize: '60px', color: 'grey'}}/>
                    </Typography>

                    <TextField
                        id="profile-name"
                        label="NAME"
                        defaultValue={props.responseData["full_name"]}
                        InputProps={textFieldProps.input}
                        InputLabelProps={textFieldProps.label}
                        variant="standard"
                    />
                    <TextField
                        id="profile-dob"
                        label="DATE OF BIRTH"
                        defaultValue={props.responseData["date_of_birth"]}
                        InputProps={textFieldProps.input}
                        InputLabelProps={textFieldProps.label}
                        variant="standard"
                    />
                    <TextField
                        id="profile-email"
                        label="EMAIL"
                        defaultValue={props.responseData["email"]}
                        InputProps={textFieldProps.input}
                        InputLabelProps={textFieldProps.label}
                        variant="standard"
                    />
                    <TextField
                        id="profile-country"
                        label="COUNTRY"
                        defaultValue={props.responseData["country"]}
                        InputProps={textFieldProps.input}
                        InputLabelProps={textFieldProps.label}
                        variant="standard"
                    />
                    <TextField
                        id="profile-zip"
                        label="ZIP CODE"
                        defaultValue={props.responseData["zipcode"]}
                        InputProps={textFieldProps.input}
                        InputLabelProps={textFieldProps.label}
                        variant="standard"
                    />
                </Paper>
            </Box>
        </DefaultLayout>
    );
}
