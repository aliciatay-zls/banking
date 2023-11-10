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
        MuiButton: {
            variants: [
                {
                    props: { variant: 'no-caps' },
                    style: {
                        textTransform: 'none',
                        textAlign: 'left',
                        lineHeight: 1.2,
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
                    },
                },
            ],
        }
    }
});

BankTheme = responsiveFontSizes(BankTheme);

export default BankTheme;
