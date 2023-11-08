export default function getHomepagePath(data) {
    const clientRole = data?.role || '';
    const customerId = data?.cid || '';

    //redirect to diff pages based on role
    if (clientRole === 'admin') {
        return '/customers';
    } else if (clientRole === 'user') {
        if (customerId === '') {
            throw new Error("No cid in response, cannot continue");
        }
        return `/customers/${customerId}`;
    }

    throw new Error("Unknown role");
}
