import DefaultLayout from "../../../components/defaultLayout";
import serverSideProps from "../../../src/serverSideProps";

export async function getServerSideProps(context) {
    return await serverSideProps(context);
}

export default function CustomerHomePage(props) {
    return (
        <DefaultLayout
            clientInfo={props.clientInfo}
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
