import { useState } from "react";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function PasswordField({isLoginPage = true, id, name = "password", label = "Password", val, handler}) {
    const [showPassword, setShowPassword] = useState(false);
    const InputComponent = isLoginPage ? Input : OutlinedInput;

    function handleClickShowPassword() {
        setShowPassword(!showPassword);
    }

    function handleMouseDownPassword(event) {
        event.preventDefault();
    }

    return (
        <FormControl
            required
            className={isLoginPage ? "login__field" : "register__field"}
            fullWidth
            size="small"
        >
            <InputLabel id={id.concat("__label")} htmlFor={id}>{label}</InputLabel>
            <InputComponent
                type={showPassword ? 'text' : 'password'}
                id={id}
                name={name}
                label={label}
                endAdornment={
                    <InputAdornment id={id.concat("__adornment")} position="end">
                        <IconButton
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                        >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                    </InputAdornment>
                }
                autoComplete={isLoginPage ? "current-password" : "new-password"}
                inputProps={{ maxLength: 64 }}
                value={val}
                onChange={e => handler(e)}
            />
        </FormControl>
    );
}
