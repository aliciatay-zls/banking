import '../styles/global.css';

import { StyledEngineProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { Fragment, createContext, useState } from "react";
import { CookiesProvider } from "react-cookie";

export const DataToDisplayContext = createContext(null);

export default function MyApp({ Component, pageProps }) {
    const [dataToDisplay, setDataToDisplay] = useState({
        isLoggingOut: false,
        pageData: [],
    });

    return (
        <StyledEngineProvider injectFirst>
            <CookiesProvider>
                <DataToDisplayContext.Provider value={{dataToDisplay: dataToDisplay, setDataToDisplay: setDataToDisplay}}>
                    <Fragment>
                        <CssBaseline />
                        <Component {...pageProps} />
                    </Fragment>
                </DataToDisplayContext.Provider>
            </CookiesProvider>
        </StyledEngineProvider>
    );
}
