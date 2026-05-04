import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname, search } = request.nextUrl;

  // Read environment variables at RUNTIME
  const authUrl = (process.env.AUTH_SERVICE_URL || 'http://auth-service:5000').replace(/\/$/, '');
  const menuUrl = (process.env.MENU_SERVICE_URL || 'http://menu-service:5000').replace(/\/$/, '');
  const orderUrl = (process.env.ORDER_SERVICE_URL || 'http://order-service:5000').replace(/\/$/, '');
  const inventoryUrl = (process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:5000').replace(/\/$/, '');
  const paymentUrl = (process.env.PAYMENT_SERVICE_URL || 'http://payment-service:5000').replace(/\/$/, '');
  const analyticsUrl = (process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:5000').replace(/\/$/, '');

  if (pathname.startsWith('/api/auth')) {
    return NextResponse.rewrite(new URL(pathname.replace('/api/auth', '') + search, authUrl));
  }
  if (pathname.startsWith('/api/menu')) {
    return NextResponse.rewrite(new URL(pathname.replace('/api/menu', '/menu') + search, menuUrl));
  }
  if (pathname.startsWith('/api/inventory')) {
    return NextResponse.rewrite(new URL(pathname.replace('/api/inventory', '/inventory') + search, inventoryUrl));
  }
  if (pathname.startsWith('/api/orders')) {
    return NextResponse.rewrite(new URL(pathname.replace('/api/orders', '/orders') + search, orderUrl));
  }
  if (pathname.startsWith('/api/payments')) {
    return NextResponse.rewrite(new URL(pathname.replace('/api/payments', '/payments') + search, paymentUrl));
  }
  if (pathname.startsWith('/api/analytics')) {
    return NextResponse.rewrite(new URL(pathname.replace('/api/analytics', '') + search, analyticsUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
