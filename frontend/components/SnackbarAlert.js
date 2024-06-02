import { forwardRef } from "react";
import AlertTitle from "@mui/material/AlertTitle";
import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

export default function SnackbarAlert({openSnackbarAlert, handleClose, duration = 5000, isError, title, msg}) {
    const CustomAlert = forwardRef(function CustomAlert(props, ref) {
        return <MuiAlert elevation={6} ref={ref} variant="standard" {...props} />;
    });

    return (
        <Snackbar
            open={openSnackbarAlert}
            onClose={handleClose}
            autoHideDuration={duration}
            disableWindowBlurListener
        >
            <CustomAlert
                className="alert"
                severity={isError ? "error" : "success"}
                onClose={handleClose}
            >
                <AlertTitle>{title}</AlertTitle>
                {msg}
            </CustomAlert>
        </Snackbar>
    );
}
