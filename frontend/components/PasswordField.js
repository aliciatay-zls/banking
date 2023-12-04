import { useState } from "react";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function PasswordField({id, name = "password", label = "Password", val, handler}) {
    const [showPassword, setShowPassword] = useState(false);

    function handleClickShowPassword() {
        setShowPassword(!showPassword);
    }

    function handleMouseDownPassword(event) {
        event.preventDefault();
    }

    return (
        <FormControl
            required
            variant="outlined"
            fullWidth
            size="small"
        >
            <InputLabel htmlFor={id}>{label}</InputLabel>
            <OutlinedInput
                type={showPassword ? 'text' : 'password'}
                id={id}
                name={name}
                label={label}
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                        >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                    </InputAdornment>
                }
                value={val}
                onChange={e => handler(e)}
            />
        </FormControl>
    );
}
