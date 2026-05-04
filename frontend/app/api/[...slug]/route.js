import { NextResponse } from 'next/server';

function getTargetUrl(slug) {
    const service = slug[0]; // e.g. "auth", "menu", "inventory", "orders", "payments", "analytics"
    
    // Read from standard Node.js process.env at runtime
    const authUrl = (process.env.AUTH_SERVICE_URL || 'http://auth-service:5000').replace(/\/$/, '');
    const menuUrl = (process.env.MENU_SERVICE_URL || 'http://menu-service:5000').replace(/\/$/, '');
    const orderUrl = (process.env.ORDER_SERVICE_URL || 'http://order-service:5000').replace(/\/$/, '');
    const inventoryUrl = (process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:5000').replace(/\/$/, '');
    const paymentUrl = (process.env.PAYMENT_SERVICE_URL || 'http://payment-service:5000').replace(/\/$/, '');
    const analyticsUrl = (process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:5000').replace(/\/$/, '');

    // The full path after /api/
    const fullPath = slug.join('/');

    if (fullPath.startsWith('auth/')) {
        return `${authUrl}/${slug.slice(1).join('/')}`;
    }
    if (fullPath === 'menu/categories') {
        return `${menuUrl}/categories`;
    }
    if (fullPath === 'menu' || fullPath.startsWith('menu/')) {
        return `${menuUrl}/${fullPath}`;
    }
    if (fullPath === 'inventory' || fullPath.startsWith('inventory/')) {
        return `${inventoryUrl}/${fullPath}`;
    }
    if (fullPath === 'orders' || fullPath.startsWith('orders/')) {
        return `${orderUrl}/${fullPath}`;
    }
    if (fullPath === 'payments' || fullPath.startsWith('payments/')) {
        return `${paymentUrl}/${fullPath}`;
    }
    if (fullPath.startsWith('analytics/')) {
        return `${analyticsUrl}/${slug.slice(1).join('/')}`;
    }

    return null;
}

async function handleProxy(req, context) {
    try {
        const { params } = context;
        const resolvedParams = await params;
        const slug = resolvedParams.slug;
        const targetUrl = getTargetUrl(slug);
        
        if (!targetUrl) {
            return NextResponse.json({ error: "Service not found" }, { status: 404 });
        }

        const targetUrlWithQuery = req.nextUrl.search 
            ? `${targetUrl}${req.nextUrl.search}`
            : targetUrl;

        const options = {
            method: req.method,
            headers: {},
        };

        // Forward headers (except host)
        req.headers.forEach((value, key) => {
            if (key !== 'host' && key !== 'connection') {
                options.headers[key] = value;
            }
        });

        // Forward body for non-GET requests
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            options.body = await req.text();
        }

        const response = await fetch(targetUrlWithQuery, options);
        
        // Prepare response headers
        const responseHeaders = new Headers();
        response.headers.forEach((value, key) => {
            const lowerKey = key.toLowerCase();
            if (lowerKey !== 'content-encoding' && lowerKey !== 'content-length' && lowerKey !== 'transfer-encoding') {
                responseHeaders.set(key, value);
            }
        });

        // Get the response text
        const responseText = await response.text();

        return new NextResponse(responseText, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });

    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json({ error: "Internal Gateway Error" }, { status: 500 });
    }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;
export const PATCH = handleProxy;
