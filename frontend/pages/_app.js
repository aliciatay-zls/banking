import { createContext, useState } from "react";
import { CookiesProvider } from "react-cookie";

import '../styles/global.css';

export const DataToDisplayContext = createContext(null);

export default function MyApp({ Component, pageProps }) {
    const [dataToDisplay, setDataToDisplay] = useState({
        isLoggingOut: false,
        pageData: [],
    });

    return (
        <CookiesProvider>
            <DataToDisplayContext.Provider value={{dataToDisplay: dataToDisplay, setDataToDisplay: setDataToDisplay}}>
                <noscript>
                    <p className="message-error">This site requires JavaScript to work. Please enable it to continue.</p>
                </noscript>
                <Component {...pageProps} />
            </DataToDisplayContext.Provider>
        </CookiesProvider>
    );
}
