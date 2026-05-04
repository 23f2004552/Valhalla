/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactCompiler: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async rewrites() {
    // On Render: each service has its own public URL set via env vars
    // On Docker Compose: defaults to internal container hostnames
    const authUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:5000';
    const menuUrl = process.env.MENU_SERVICE_URL || 'http://menu-service:5000';
    const orderUrl = process.env.ORDER_SERVICE_URL || 'http://order-service:5000';
    const inventoryUrl = process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:5000';
    const paymentUrl = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:5000';
    const analyticsUrl = process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:5000';

    return [
      {
        source: '/api/auth/:path*',
        destination: `${authUrl}/:path*`,
      },
      {
        source: '/api/menu/categories',
        destination: `${menuUrl}/categories`,
      },
      {
        source: '/api/menu',
        destination: `${menuUrl}/menu`,
      },
      {
        source: '/api/menu/:path*',
        destination: `${menuUrl}/menu/:path*`,
      },
      {
        source: '/api/inventory',
        destination: `${inventoryUrl}/inventory`,
      },
      {
        source: '/api/inventory/:path*',
        destination: `${inventoryUrl}/inventory/:path*`,
      },
      {
        source: '/api/orders',
        destination: `${orderUrl}/orders`,
      },
      {
        source: '/api/orders/:path*',
        destination: `${orderUrl}/orders/:path*`,
      },
      {
        source: '/api/payments',
        destination: `${paymentUrl}/payments`,
      },
      {
        source: '/api/payments/:path*',
        destination: `${paymentUrl}/payments/:path*`,
      },
      {
        source: '/api/analytics/:path*',
        destination: `${analyticsUrl}/:path*`,
      }
    ];
  },
};

module.exports = nextConfig;
