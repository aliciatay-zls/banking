import { NextResponse } from 'next/server';

const validPaths = [
    /^\/customers$/,
    /^\/customers\/([0-9]+)$/,
    /^\/customers\/([0-9]+)\/profile$/,
    /^\/customers\/([0-9]+)\/account\/new$/,
    /^\/customers\/([0-9]+)\/account\/([0-9]+)$/,
    /^\/customers\/([0-9]+)\/account\/([0-9]+)\/success$/,
];

export default function middleware(request) {
    const url = request.nextUrl.clone();
    if (url.pathname === '/') {
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    if (url.pathname.startsWith('/customers')) {
        const isValidPath = validPaths.some((re) => re.test(url.pathname));
        if (!isValidPath) {
            url.pathname = '/404';
            return NextResponse.redirect(url);
        }
    }

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
