import DefaultLayout from "../../../components/defaultLayout";
import handleFetchResource from "../../../src/handleFetchResource";
import serverSideProps from "../../../src/serverSideProps";

export async function getServerSideProps(context) {
    const initProps = await serverSideProps(context);
    if (!initProps.props) {
        return initProps;
    }

    const request = {
        method: "GET",
        headers: { "Authorization": "Bearer " + initProps.props.accessToken },
    };

    return await handleFetchResource(initProps.props.currentPath, initProps.props.requestURL, request);
}

export default function CustomerHomePage(props) {
    return (
        <DefaultLayout
            tabTitle={"Home"}
            headerTitle={"My Profile"}
        >
            <div>
                <p>Name: {props.responseData["full_name"]}</p>
                <ul>
                    <li>Date of Birth: {props.responseData["date_of_birth"]}</li>
                    <li>City: {props.responseData["city"]}</li>
                    <li>Zip Code: {props.responseData["zipcode"]}</li>
                </ul>
            </div>
        </DefaultLayout>
    );
}
