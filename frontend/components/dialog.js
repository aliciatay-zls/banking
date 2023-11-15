import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";

export default function ConfirmationDialog({open, handleNo, handleYes, title}) {
    return (
        <Dialog
            open={open}
            onClose={handleNo}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogActions>
                <Button onClick={handleNo}>No</Button>
                <Button onClick={handleYes}>Yes</Button>
            </DialogActions>
        </Dialog>
    );
}
