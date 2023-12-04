import { forwardRef } from "react";
import AlertTitle from "@mui/material/AlertTitle";
import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

export default function SnackbarAlert({openSnackbarAlert, handleClose, isError, title, msg}) {
    const CustomAlert = forwardRef(function CustomAlert(props, ref) {
        return <MuiAlert elevation={6} ref={ref} variant="standard" {...props} />;
    });

    return (
        <Snackbar
            open={openSnackbarAlert}
            autoHideDuration={5000}
            onClose={handleClose}
        >
            <CustomAlert
                severity={isError ? "error" : "success"}
                sx={{ width: '100%', textAlign: 'left' }}
                onClose={handleClose}
            >
                <AlertTitle>{title}</AlertTitle>
                {msg}
            </CustomAlert>
        </Snackbar>
    );
}
