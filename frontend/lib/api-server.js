import "server-only";

const INTERNAL_API_URL = "http://localhost:3000/api";

export async function fetchServer(endpoint) {
  // endpoint e.g., "/analytics/daily-sales" or "/orders"
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const parts = cleanEndpoint.split('/');
  const service = parts[0];
  
  let targetUrl = '';
  if (service === 'analytics') {
      targetUrl = `${(process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:5000').replace(/\/$/, '')}/${parts.slice(1).join('/')}`;
  } else if (service === 'orders') {
      targetUrl = `${(process.env.ORDER_SERVICE_URL || 'http://order-service:5000').replace(/\/$/, '')}/${cleanEndpoint}`;
  } else if (service === 'inventory') {
      targetUrl = `${(process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:5000').replace(/\/$/, '')}/${cleanEndpoint}`;
  } else {
      throw new Error(`Unknown service prefix in endpoint: ${endpoint}`);
  }

  const res = await fetch(targetUrl, {
    cache: "no-store", // Dynamic data
    headers: {
      "Content-Type": "application/json",
      "X-INTERNAL-TOKEN": process.env.SERVICE_TOKEN || "",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint} from ${targetUrl}: ${res.status}`);
  }

  return res.json();
}
