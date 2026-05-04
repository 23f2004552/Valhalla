import "server-only";

const INTERNAL_API_URL = "http://localhost:3000/api";

export async function fetchServer(endpoint) {
  const res = await fetch(`${INTERNAL_API_URL}${endpoint}`, {
    cache: "no-store", // Dynamic data
    headers: {
      "Content-Type": "application/json",
      "X-INTERNAL-TOKEN": process.env.SERVICE_TOKEN || "",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${res.status}`);
  }

  return res.json();
}
