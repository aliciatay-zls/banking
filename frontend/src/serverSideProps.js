import authServerSideProps from "./authServerSideProps";
import handleFetchResource from "./handleFetchResource";

/**
 * Ensures the client is logged in, then sends a GET request to the backend resource server to retrieve the
 * data to display on the page.
 */
export default async function getServerSideProps(context) {
    const initProps = await authServerSideProps(context);
    if (!initProps.props) {
        return initProps;
    }

    const request = {
        method: "GET",
        headers: { "Authorization": "Bearer " + initProps.props.accessToken, "Content-Type": "application/json" },
    };

    const finalProps = await handleFetchResource(initProps.props.currentPath, initProps.props.requestURL, request);
    if (!finalProps.props) {
        return finalProps;
    }

    return {
        props: {
            homepage: initProps.props.homepage,
            responseData: finalProps.props.responseData,
            currentPath: finalProps.props.currentPath,
        }
    }
}
