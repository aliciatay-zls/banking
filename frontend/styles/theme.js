import { createTheme } from '@mui/material/styles';
import { responsiveFontSizes } from "@mui/material";

let BankTheme = createTheme({
    typography: {
        fontFamily: [
            "General Sans",
            "-apple-system",
            "BlinkMacSystemFont",
            "Segoe UI",
            "Roboto",
            "Helvetica Neue",
            "Arial",
            "sans-serif",
            "Apple Color Emoji",
            "Segoe UI Emoji",
            "Segoe UI Symbol",
        ].join(","),
        lineHeight: 1.5,
        letterSpacing: '0.2px',
        fontWeightRegular: 400, // This sets the default font weight
    },
    components: {
        MuiAlert: {
            styleOverrides: {
                icon: {
                    marginRight: '6px',
                }
            },
        },
        MuiButton: {
            variants: [
                {
                    props: { variant: 'no-caps' },
                    style: {
                        textTransform: 'none',
                        textAlign: 'left',
                        lineHeight: 1.2,
                        color: '#85011e',
                    },
                },
                {
                    props: { variant: 'contained bank-theme' },
                    style: {
                        color: '#FFFFFF',
                        backgroundColor: '#85011e',
                        '&:hover': {
                            backgroundColor: '#9D1A38FF',
                            borderColor: '#85011e',
                            boxShadow: 'none',
                        },
                        '&.Mui-disabled': {
                            color: '#FFFFFF',
                            backgroundColor: '#B0BEC5',
                        },
                    },
                },
            ],
        }
    }
});

BankTheme = responsiveFontSizes(BankTheme);

export default BankTheme;
