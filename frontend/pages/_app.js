import { createContext, useState } from "react";
import { CookiesProvider } from "react-cookie";

export const DataToDisplayContext = createContext(null);
export const LoggedInContext = createContext(null);

export default function MyApp({ Component, pageProps }) {
    const [dataToDisplay, setDataToDisplay] = useState([]);
    const [currentLoggedIn, setCurrentLoggedIn] = useState({role: ''});

    return (
        <CookiesProvider>
            <LoggedInContext.Provider value={{currentLoggedIn: currentLoggedIn, setCurrentLoggedIn: setCurrentLoggedIn}}>
                <DataToDisplayContext.Provider value={{dataToDisplay: dataToDisplay, setDataToDisplay: setDataToDisplay}}>
                    <noscript>
                        <p style={{ color: 'red'}}>This site requires JavaScript to work. Please enable it to continue.</p>
                    </noscript>
                    <Component {...pageProps} />
                </DataToDisplayContext.Provider>
            </LoggedInContext.Provider>
        </CookiesProvider>
    );
}
