# FleetFlow

Fleet management system built for the **Odoo x Gujarat Vidyapith Hackathon** by **Team Atri**.

Two-part application — a FastAPI backend with SQLite and a React SPA frontend — providing role-based dashboards for fleet managers and dispatchers (drivers).

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite 7, react-router-dom 7, Recharts, Lucide React |
| **Backend** | FastAPI, SQLAlchemy, Pydantic v2, bcrypt, Uvicorn, Python 3.13+ |
| **Database** | SQLite (auto-created) |
| **Styling** | Vanilla CSS — custom properties, glassmorphism, responsive (3 breakpoints) |

---

## Repository Structure

```
FleetFlow-TeamAtri/
├── backend/                # FastAPI REST API
│   ├── app/
│   │   ├── main.py         # Entry point, CORS, manager seed
│   │   ├── api/            # Route handlers (auth, vehicles, trips, maintenance, dashboard)
│   │   ├── models/         # SQLAlchemy models (User, Vehicle, Trip, MaintenanceRequest)
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   ├── services/       # Business logic layer
│   │   ├── core/           # Config, security, RBAC
│   │   ├── db/             # DB engine, session factory
│   │   └── utils/          # Auth dependencies (get_current_user, manager_required)
│   └── pyproject.toml
├── frontend/               # React SPA
│   ├── src/
│   │   ├── App.jsx         # Router + route guards
│   │   ├── context/        # AuthContext, MaintenanceContext
│   │   ├── components/     # Layout, Sidebar, Header, DriverLayout, Modal, Toast
│   │   ├── pages/          # Admin pages (7) + Driver pages (5) + Login/AccessDenied
│   │   ├── data/           # Mock data (vehicles, drivers, trips, expenses, etc.)
│   │   └── services/       # (reserved for API integration)
│   └── package.json
└── README.md               # ← you are here
```

---

## Backend

### Authentication

Session-based (no JWT). Login returns a UUID token stored in-memory. All authenticated requests pass it via the `token` HTTP header. Passwords hashed with bcrypt.

| Role | Creation |
|------|----------|
| `manager` | Auto-seeded on startup from `.env` |
| `dispatcher` | Created by manager via API |

### API Endpoints

#### Auth — `/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | — | Returns `{ token, role }` |
| POST | `/auth/dispatchers` | Manager | Create dispatcher |
| GET | `/auth/dispatchers` | Manager | List dispatchers |
| PATCH | `/auth/me/status` | Dispatcher | Toggle duty status |
| DELETE | `/auth/dispatchers/{id}` | Manager | Delete dispatcher |

#### Vehicles — `/vehicle`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/vehicle/` | Manager | Add vehicle |
| GET | `/vehicle/` | Manager | List vehicles |
| GET | `/vehicle/{id}` | Manager | Get vehicle |
| PUT | `/vehicle/{id}` | Manager | Update vehicle |
| DELETE | `/vehicle/{id}` | Manager | Delete vehicle |

Statuses: `available` · `on_trip` · `in_shop` · `retired`

#### Trips — `/trips`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/trips/` | Manager | Create & assign trip |
| GET | `/trips/` | Manager | List all trips |
| GET | `/trips/me` | Dispatcher | List own trips |
| PATCH | `/trips/{id}/start` | Dispatcher | assigned → in_progress |
| PATCH | `/trips/{id}/complete` | Dispatcher | in_progress → completed |

Statuses: `assigned` → `in_progress` → `completed` / `cancelled`

#### Maintenance — `/maintenance`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/maintenance/` | Dispatcher | Submit request |
| GET | `/maintenance/me` | Dispatcher | Own requests |
| GET | `/maintenance/` | Manager | All requests |
| PATCH | `/maintenance/{id}/status` | Manager | Approve/reject/complete |

Statuses: `pending` → `approved` / `rejected` / `completed`

#### Dashboard — `/dashboard`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/dashboard/kpis` | Manager | Fleet stats, revenue, leaderboards |

### Database Models

| Model | Key Fields |
|-------|------------|
| **User** | email, password_hash, role (`manager`/`dispatcher`), name, mobile, license info, duty_status |
| **Vehicle** | name, plate_number, category, region, capacity_kg, odometer, status |
| **Trip** | vehicle_id, dispatcher_id, total_km, start/end_time, payment_amount, status |
| **MaintenanceRequest** | dispatcher_id, vehicle_id, maintenance_type, description, estimated_cost, workshop, status |

### Request Flow

```
Client → token header → dependencies.py (auth check) → API route → service → SQLAlchemy → SQLite
```

---

## Frontend

### Routing & Access Control

Four route guards in `App.jsx`:

| Guard | Behavior |
|-------|----------|
| `PublicRoute` | Login pages only — redirects authenticated users |
| `RequireAuth` | Must be logged in |
| `AdminRoute` | Manager role required |
| `DriverRoute` | Staff/dispatcher role required |

### Route Map

| Path | Guard | Page |
|------|-------|------|
| `/login` | Public | Staff Login |
| `/admin-login` | Public | Admin Login |
| `/dashboard` | Admin | Dashboard |
| `/vehicles` | Admin | Vehicles |
| `/drivers` | Admin | Drivers |
| `/trips` | Admin | Trips |
| `/maintenance` | Admin | Maintenance |
| `/expenses` | Admin | Expenses |
| `/reports` | Admin | Reports |
| `/driver` | Driver | Driver Dashboard |
| `/driver/invitations` | Driver | Ride Invitations |
| `/driver/active-trip` | Driver | Active Trip |
| `/driver/maintenance` | Driver | Driver Maintenance |
| `/driver/profile` | Driver | Driver Profile |

### Features

**Admin (Manager)**
- Dashboard — KPI cards, weekly trip chart, fleet status pie, activity feed, compliance alerts
- Vehicles — card grid, status filters, search, add modal with validation
- Drivers — table with license expiry color-coding, compliance summary, add modal
- Trips — dispatch modal with capacity validation (blocks overload), toast notifications
- Maintenance — dual filter (status + reimbursement), bill preview, approve/reject
- Expenses — KPI cards, monthly stacked chart, expense table
- Reports — utilization trend, expense breakdown, top vehicles, driver performance

**Driver (Dispatcher)**
- Dashboard — welcome hero, KPI stats, quick actions, inline maintenance form
- Ride Invitations — accept/decline with vehicle & cargo details
- Active Trip — step-by-step progress tracker
- Maintenance — submit requests, upload bills, mark done, track reimbursement
- Profile — edit contact info, license status, trip stats

### Data Layer

Currently **mock data only** — `data/mockData.js` provides all seed data. The `services/` directory is scaffolded but empty, ready for backend API integration.

### Responsive Design

| Breakpoint | Behavior |
|------------|----------|
| ≤ 1024px | Compact sidebar, single-column charts |
| ≤ 768px | Sidebar → hamburger overlay, stacked layouts, horizontal table scroll |
| ≤ 480px | Single-column grids, minimal padding, stacked buttons |

---

## Quick Start

### Prerequisites

- Python 3.13+
- Node.js 18+

### Backend

```bash
cd backend
cp .env.example .env          # Set MANAGER_EMAIL and MANAGER_PASSWORD
uv sync                       # or: pip install -e .
uvicorn app.main:app --reload --port 8000
```

- DB auto-created as `fleetflow.db` on first run
- Manager account seeded from `.env`
- API docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

**Login** — any email/password works (auth is mocked):
- `/login` → driver interface
- `/admin-login` → manager dashboard

### Production Build

```bash
cd frontend
npm run build                 # Output: dist/
npm run preview               # Preview locally
```

---

## Environment Variables (Backend)

| Variable | Description | Default |
|----------|-------------|---------|
| `MANAGER_EMAIL` | Manager login email | (required) |
| `MANAGER_PASSWORD` | Manager login password | (required) |
| `DATABASE_URL` | SQLAlchemy connection string | `sqlite:///./fleetflow.db` |

---

## Team

**Team Atri** — Odoo x Gujarat Vidyapith Hackathon
