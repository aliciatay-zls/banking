import { CookiesProvider } from "react-cookie";
import { createContext, useState } from "react";

export const DataToDisplayContext = createContext(null);

export default function MyApp({ Component, pageProps }) {
    const [dataToDisplay, setDataToDisplay] = useState([]);
    return (
        <CookiesProvider>
            <DataToDisplayContext.Provider value={{dataToDisplay: dataToDisplay, setDataToDisplay: setDataToDisplay}}>
                <Component {...pageProps} />
            </DataToDisplayContext.Provider>
        </CookiesProvider>
    );
}
