import { Fragment, createContext, useState } from "react";
import { CookiesProvider } from "react-cookie";

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

import BankTheme from '../styles/theme';

export const DataToDisplayContext = createContext(null);

export default function MyApp({ Component, pageProps }) {
    const [dataToDisplay, setDataToDisplay] = useState({
        isLoggingOut: false,
        pageData: [],
    });

    return (
        <CookiesProvider>
            <DataToDisplayContext.Provider value={{dataToDisplay: dataToDisplay, setDataToDisplay: setDataToDisplay}}>
                <ThemeProvider theme={BankTheme}>
                    <noscript>
                        <p className="message-error">This site requires JavaScript to work. Please enable it to continue.</p>
                    </noscript>
                    <Fragment>
                        <CssBaseline />
                        <Component {...pageProps} />
                    </Fragment>
                </ThemeProvider>
            </DataToDisplayContext.Provider>
        </CookiesProvider>
    );
}
