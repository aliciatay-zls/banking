export default function getHomepagePath(data) {
    const clientRole = data?.role || '';
    const customerId = data?.cid || '';

    //redirect to diff pages based on role
    if (clientRole === 'admin') {
        return '/customers';
    } else if (clientRole === 'user' && customerId !== '') {
        return `/customers/${customerId}`;
    } else {
        console.log("Unknown role or no cid in response");
        return "/login";
    }

}
