import { NextResponse } from 'next/server';

export default function middleware(request) {
    const nonce = crypto.randomUUID().toString();
    const cspHeader = `
        default-src 'self' https://${process.env.RESC_SERVER_ADDRESS} https://${process.env.AUTH_SERVER_ADDRESS}; 
        style-src 'self' 'nonce-${nonce}';
        script-src 'self';
        navigate-to 'self';
    `;

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('Content-Security-Policy', cspHeader.replace(/\s{2,}/g, ' ').trim());

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}
