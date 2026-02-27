# 🍽️ Valhalla Suite — Restaurant Intelligence System

> A premium, full-stack restaurant management system built on a microservices architecture. Designed for fine dining operations, Valhalla brings together real-time order management, live inventory tracking, payment analytics, and a cinematic customer-facing menu experience into a single self-hosted platform.

---

## 📸 Preview

| Admin Dashboard | Orders Panel | Menu Experience |
|---|---|---|
| Dark luxury aesthetic with live stats | Real-time order queue with bulk actions | Cinematic menu scrolling with GSAP |

---

## 🏗️ Architecture Overview

Valhalla is split into a **frontend** and multiple **backend microservices**, communicating through an **Nginx API Gateway**. All services are containerized and orchestrated with **Docker Compose**.

```
┌─────────────────────────────────────────────────────┐
│                  Client Browser                      │
└────────────────────┬────────────────────────────────┘
                     │ HTTP :3000
┌────────────────────▼────────────────────────────────┐
│            Next.js Frontend (React 19)               │
│     Admin Panel • Menu • Orders • Analytics          │
└────────────────────┬────────────────────────────────┘
                     │ HTTP :8080
┌────────────────────▼────────────────────────────────┐
│              Nginx API Gateway (:8080)                │
│         Routing • CORS • Rate Limiting               │
└──┬──────────┬────────┬──────────┬─────────┬─────────┘
   │          │        │          │         │
┌──▼──┐  ┌───▼──┐ ┌───▼──┐  ┌───▼──┐  ┌───▼───────┐
│Auth │  │Order │ │Menu  │  │Inv.  │  │Payment    │
│:5000│  │:5000 │ │:5000 │  │:5000 │  │:5000      │
└──┬──┘  └───┬──┘ └───┬──┘  └───┬──┘  └───┬───────┘
   │          │        │ Redis   │         │
   └──────────┴────────┴─────────┴─────────┘
                        │
               ┌────────▼────────┐
               │   PostgreSQL     │
               │ (Per-Service DB) │
               └─────────────────┘
```

### Services

| Service | Language | Port | Description |
|---|---|---|---|
| `frontend` | Next.js 16 / React 19 | 3000 | Customer UI + Admin Panel |
| `gateway` | Nginx | 8080 | API Gateway / Reverse Proxy |
| `auth-service` | Python / FastAPI | 5000 | JWT Auth & Admin Sessions |
| `order-service` | Python / FastAPI | 5000 | Order lifecycle management |
| `menu-service` | Python / FastAPI | 5000 | Menu items & categories |
| `inventory-service` | Python / FastAPI | 5000 | Ingredient stock tracking |
| `payment-service` | Python / FastAPI | 5000 | Transaction records |
| `analytics-service` | Python / FastAPI | 5000 | Sales & revenue analytics |

### Infrastructure

| Service | Port | Purpose |
|---|---|---|
| PostgreSQL 15 | Internal | Per-service relational databases |
| Redis (Alpine) | Internal | Caching (menu, sessions) |
| RabbitMQ 3 | Internal | Async event messaging |
| Jaeger | 16686 | Distributed request tracing |
| Prometheus | 9090 | Metrics collection |
| Grafana | 3001 | Metrics dashboards |

---

## ✅ Prerequisites

Make sure the following are installed on your system before proceeding:

- **Docker Desktop** — [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
- **Docker Compose** (included with Docker Desktop)
- **Git** — [https://git-scm.com](https://git-scm.com)
- **Node.js v20+** *(only needed for local frontend dev)* — [https://nodejs.org](https://nodejs.org)

Verify your installations:

```bash
docker --version
docker compose version
git --version
node --version   # Optional
```

---

## 🚀 Quick Start — Run Everything with Docker

This is the recommended way. One command brings up all 11+ services.

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Kmennn/valhalla.git
cd valhalla
```

### Step 2 — Create the Environment File

Copy the example env file and edit it if needed:

```bash
# On Windows PowerShell
Copy-Item .env.example .env

# On macOS / Linux
cp .env.example .env
```

The `.env` file contains:

```env
SERVICE_TOKEN=dev_secret_token_123
FRONTEND_ORIGIN=http://localhost:3000
```

> ⚠️ **Important:** Do **not** commit your `.env` file to GitHub. It is already in `.gitignore`.

### Step 3 — Build and Start All Services

```bash
docker compose up --build
```

This will:
1. Build the Next.js frontend image
2. Build all 6 Python microservice images
3. Pull Nginx, PostgreSQL, Redis, RabbitMQ, Prometheus, Grafana, Jaeger
4. Run database initialization scripts
5. Start all services

> ⏱️ First build takes ~5–10 minutes depending on your internet speed. Subsequent starts are much faster.

### Step 4 — Open the App

| URL | What You'll See |
|---|---|
| http://localhost:3000 | 🍽️ Customer-facing restaurant menu |
| http://localhost:3000/admin/login | 🔐 Admin Panel login |
| http://localhost:8080/api | 🔗 API Gateway (all backend routes) |
| http://localhost:3001 | 📊 Grafana dashboards |
| http://localhost:9090 | 📈 Prometheus metrics |
| http://localhost:16686 | 🔍 Jaeger tracing |

### Step 5 — Login to Admin Panel

Navigate to: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

Default admin credentials (seeded on first run):
```
Username: admin
Password: admin123
```

> You can change these via the Settings page in the admin panel.

---

## 🛑 Stopping the System

```bash
# Stop all containers (keeps data)
docker compose down

# Stop and wipe all data (full reset)
docker compose down -v
```

---

## 🔄 Restarting After Code Changes

If you modify any source code:

```bash
# Rebuild only the frontend
docker compose build frontend
docker compose up -d --force-recreate frontend

# Rebuild a specific backend service (e.g., order-service)
docker compose build order-service
docker compose up -d --force-recreate order-service

# Rebuild everything
docker compose up --build
```

---

## 💻 Local Frontend Development (Optional)

If you want hot-reload while developing the frontend, run it locally instead of via Docker.

### Step 1 — Install Dependencies

```bash
cd frontend
npm install
```

### Step 2 — Start Dev Server

```bash
npm run dev
```

Frontend will be available at: [http://localhost:3000](http://localhost:3000)

> Note: The backend services still need to be running via Docker Compose for API calls to work.

### Other Frontend Commands

```bash
# Build for production
npm run build

# Start production server (after build)
npm run start

# Run linter
npm run lint
```

---

## 🗄️ Database

Each microservice uses its own isolated PostgreSQL database. Databases are automatically created and seeded on first run by the init scripts in `./scripts/`.

### Database Names

| Service | Database |
|---|---|
| Auth | `authdb` |
| Orders | `orderdb` |
| Menu | `menudb` |
| Inventory | `inventorydb` |
| Payments | `paymentdb` |
| Analytics | `analyticsdb` |

### Connecting to a Database (for debugging)

```bash
# Connect to the orders database
docker exec -it rms-db psql -U postgres -d orderdb

# List all databases
docker exec -it rms-db psql -U postgres -c "\l"
```

---

## 📡 API Reference

All API calls go through the Nginx Gateway at `http://localhost:8080/api/`.

### Auth
```
POST   /api/auth/login          # Get JWT token
POST   /api/auth/register       # Register admin user
```

### Menu
```
GET    /api/menu                # List all menu items
GET    /api/menu/categories     # List categories
POST   /api/menu                # Create item (admin)
PUT    /api/menu/{id}           # Update item (admin)
```

### Orders
```
GET    /api/orders              # List all orders
POST   /api/orders              # Create new order
PUT    /api/orders/{id}/status  # Update order status
```

### Inventory
```
GET    /api/inventory           # List all ingredients
POST   /api/inventory           # Add ingredient
PUT    /api/inventory/{id}      # Update stock
```

### Payments
```
GET    /api/payments            # List transactions
POST   /api/payments            # Record payment
```

### Analytics
```
GET    /api/analytics/daily-sales    # Daily revenue
GET    /api/analytics/top-items      # Top selling dishes
```

---

## 📐 Project Structure

```
valhalla/
├── frontend/                   # Next.js 16 App
│   ├── app/                    # App Router pages
│   │   ├── admin/              # Admin Panel (dashboard, orders, menu, staff, settings)
│   │   ├── analytics/          # Analytics page
│   │   └── ...
│   ├── components/
│   │   ├── admin/              # Admin UI components (Sidebar, OrdersPanel, etc.)
│   │   └── ...                 # Customer-facing components
│   └── lib/api.js              # Axios API client
│
├── auth-service/               # FastAPI Auth Microservice
├── order-service/              # FastAPI Order Microservice
├── menu-service/               # FastAPI Menu Microservice
├── inventory-service/          # FastAPI Inventory Microservice
├── payment-service/            # FastAPI Payment Microservice
├── analytics-service/          # FastAPI Analytics Microservice
│
├── gateway/                    # Nginx Config
│   └── nginx.conf.template
│
├── grafana/                    # Grafana Dashboard Provisioning
├── prometheus.yml              # Prometheus scrape config
├── scripts/                    # DB init SQL + seed scripts
├── tests/                      # Integration tests
├── docker-compose.yml          # Full stack orchestration
└── .env                        # Environment variables (not committed)
```

---

## 🔍 Monitoring & Observability

### Grafana — Dashboards
Open [http://localhost:3001](http://localhost:3001)
- Default login: `admin` / `admin`
- Pre-provisioned dashboards for each service

### Prometheus — Raw Metrics
Open [http://localhost:9090](http://localhost:9090)
- Query metrics from all services

### Jaeger — Distributed Tracing
Open [http://localhost:16686](http://localhost:16686)
- Trace individual requests across all microservices

---

## 🧪 Running Tests

Integration tests are in the `./tests/` directory.

```bash
# Install test dependencies (Python)
pip install pytest httpx

# Run all tests
pytest tests/

# Run a specific test file
pytest tests/test_orders.py -v
```

---

## 🌐 Environment Variables

| Variable | Default | Description |
|---|---|---|
| `SERVICE_TOKEN` | `dev_secret_token_123` | Internal service-to-service auth token |
| `FRONTEND_ORIGIN` | `http://localhost:3000` | CORS origin for the frontend |
| `DB_HOST` | `db` | PostgreSQL host (Docker internal) |
| `DB_USER` | `postgres` | PostgreSQL username |
| `DB_PASSWORD` | `password` | PostgreSQL password |
| `REDIS_HOST` | `redis` | Redis host (Docker internal) |

> 🔒 For production deployment, replace all default credentials and tokens with secure values.

---

## 🛠️ Troubleshooting

### Port Already in Use
```bash
# Find and kill the process using port 3000
netstat -ano | findstr :3000   # Windows
lsof -i :3000                   # Mac/Linux
```

### Container Won't Start
```bash
# Check logs for a specific service
docker compose logs frontend
docker compose logs order-service
docker compose logs gateway

# Check all logs
docker compose logs -f
```

### Database Not Initialized
```bash
# Reset and re-initialize the database
docker compose down -v
docker compose up --build
```

### Frontend Shows Old Version
```bash
# Force rebuild without cache
docker compose build --no-cache frontend
docker compose up -d --force-recreate frontend
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  <strong>Built with precision for the finest dining experiences.</strong><br/>
  <em>Valhalla Suite — Restaurant Intelligence</em>
</div>
#   2 0 -  
 