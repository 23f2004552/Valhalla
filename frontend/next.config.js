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
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://auth-service:5000/:path*',
      },
      {
        source: '/api/menu/categories',
        destination: 'http://menu-service:5000/categories',
      },
      {
        source: '/api/menu',
        destination: 'http://menu-service:5000/menu',
      },
      {
        source: '/api/menu/:path*',
        destination: 'http://menu-service:5000/menu/:path*',
      },
      {
        source: '/api/inventory',
        destination: 'http://inventory-service:5000/inventory',
      },
      {
        source: '/api/inventory/:path*',
        destination: 'http://inventory-service:5000/inventory/:path*',
      },
      {
        source: '/api/orders',
        destination: 'http://order-service:5000/orders',
      },
      {
        source: '/api/orders/:path*',
        destination: 'http://order-service:5000/orders/:path*',
      },
      {
        source: '/api/payments',
        destination: 'http://payment-service:5000/payments',
      },
      {
        source: '/api/payments/:path*',
        destination: 'http://payment-service:5000/payments/:path*',
      },
      {
        source: '/api/analytics/:path*',
        destination: 'http://analytics-service:5000/:path*',
      }
    ];
  },
};

module.exports = nextConfig;
