import { createContext, useState } from "react";
import { CookiesProvider } from "react-cookie";

export const DataToDisplayContext = createContext(null);

export default function MyApp({ Component, pageProps }) {
    const [dataToDisplay, setDataToDisplay] = useState([]);
    return (
        <CookiesProvider>
            <DataToDisplayContext.Provider value={{dataToDisplay: dataToDisplay, setDataToDisplay: setDataToDisplay}}>
                <noscript>
                    <p style={{ color: 'red'}}>This site requires JavaScript to work. Please enable it to continue.</p>
                </noscript>
                <Component {...pageProps} />
            </DataToDisplayContext.Provider>
        </CookiesProvider>
    );
}
