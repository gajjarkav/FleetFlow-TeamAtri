# FleetFlow Backend

FastAPI backend for FleetFlow — a fleet management system with role-based access for managers and dispatchers.

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | FastAPI |
| ORM | SQLAlchemy |
| Database | SQLite (default) |
| Validation | Pydantic v2 |
| Auth | bcrypt + UUID session tokens |
| Server | Uvicorn |
| Python | 3.13+ |

## Project Structure

```
app/
├── main.py                 # App entry, CORS, router registration, manager seed
├── api/                    # Route handlers (controllers)
│   ├── auth.py             # Login, dispatcher CRUD, status toggle
│   ├── vehicles.py         # Vehicle CRUD
│   ├── trips.py            # Trip lifecycle (create → start → complete)
│   ├── maintenance.py      # Maintenance request workflow
│   └── dashboard.py        # Aggregated KPIs
├── models/                 # SQLAlchemy table definitions
│   ├── user.py             # Users (manager + dispatcher in one table)
│   ├── vehicle.py          # Vehicles
│   ├── trip.py             # Trips
│   └── maintenance.py      # Maintenance requests
├── schemas/                # Pydantic request/response models
│   ├── user.py
│   ├── vehicle.py
│   ├── trip.py
│   └── maintenance.py
├── services/               # Business logic (DB operations)
│   ├── auth.py
│   ├── vehicle.py
│   ├── trip.py
│   ├── maintenance.py
│   └── dashboard.py
├── core/
│   ├── config.py           # Settings from .env (pydantic-settings)
│   ├── security.py         # Password hashing, session store
│   ├── rbac.py             # (placeholder)
│   └── constant.py         # (placeholder)
├── db/
│   └── base.py             # Engine, SessionLocal, Base, get_db
└── utils/
    └── dependencies.py     # get_current_user, manager_required
```

## Authentication

- **Session-based** — no JWT. Login returns a UUID token, stored in an in-memory dict (`SESSION_STORE`).
- Token is passed via `token` HTTP header on every authenticated request.
- Passwords hashed with bcrypt.

| Role | How it's created |
|------|------------------|
| `manager` | Auto-seeded on startup from `.env` credentials |
| `dispatcher` | Created by manager via `POST /auth/dispatchers` |

## API Endpoints

### Auth (`/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | None | Returns `{ token, role }` |
| POST | `/auth/dispatchers` | Manager | Create a dispatcher account |
| GET | `/auth/dispatchers` | Manager | List all dispatchers |
| PATCH | `/auth/me/status` | Dispatcher | Toggle own duty_status (available/unavailable) |
| DELETE | `/auth/dispatchers/{user_id}` | Manager | Delete a dispatcher |

### Vehicles (`/vehicle`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/vehicle/` | Manager | Add a vehicle |
| GET | `/vehicle/` | Manager | List all vehicles |
| GET | `/vehicle/{id}` | Manager | Get single vehicle |
| PUT | `/vehicle/{id}` | Manager | Update vehicle (currently only updates status) |
| DELETE | `/vehicle/{id}` | Manager | Delete a vehicle |

Vehicle statuses: `available`, `on_trip`, `in_shop`, `retired`

### Trips (`/trips`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/trips/` | Manager | Create/assign a trip (sets vehicle → on_trip, dispatcher → unavailable) |
| GET | `/trips/` | Manager | List all trips |
| GET | `/trips/me` | Dispatcher | List own trips |
| PATCH | `/trips/{id}/start` | Dispatcher (owner) | Move trip: assigned → in_progress |
| PATCH | `/trips/{id}/complete` | Dispatcher (owner) | Move trip: in_progress → completed (frees vehicle + dispatcher, updates odometer) |

Trip statuses: `assigned` → `in_progress` → `completed` / `cancelled`

### Maintenance (`/maintenance`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/maintenance/` | Dispatcher | Submit a maintenance request |
| GET | `/maintenance/me` | Dispatcher | View own requests |
| GET | `/maintenance/` | Manager | View all requests |
| PATCH | `/maintenance/{id}/status` | Manager | Approve/reject/complete a request |

Maintenance statuses: `pending` → `approved` / `rejected` / `completed`

### Dashboard (`/dashboard`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/dashboard/kpis` | Manager | Aggregated fleet stats |

Returns: fleet utilization, driver counts, trip stats, revenue, maintenance costs, profit, top drivers/vehicles leaderboards, most common maintenance type.

## Database Models

### User
| Field | Type | Notes |
|-------|------|-------|
| id | int | PK |
| email | string | unique |
| password_hash | string | bcrypt |
| role | string | `manager` or `dispatcher` |
| name, mobile_number, license_number, license_expiry | string/datetime | dispatcher profile fields |
| duty_status | string | `available` / `unavailable` (dispatchers only) |

### Vehicle
| Field | Type | Notes |
|-------|------|-------|
| id | int | PK |
| name | string | e.g. "Tata Ace" |
| category | string | vehicle type |
| plate_number | string | unique |
| region | string | operating region |
| capacity_kg | int | cargo capacity |
| odometer | int | updated on trip completion |
| status | string | available / on_trip / in_shop / retired |

### Trip
| Field | Type | Notes |
|-------|------|-------|
| id | int | PK |
| vehicle_id | int | FK → vehicles |
| dispatcher_id | int | FK → users |
| total_km | float | trip distance |
| start_time, end_time | datetime | planned schedule |
| payment_amount | float | trip revenue |
| status | string | assigned / in_progress / completed / cancelled |

### MaintenanceRequest
| Field | Type | Notes |
|-------|------|-------|
| id | int | PK |
| dispatcher_id | int | FK → users (who submitted) |
| vehicle_id | int | FK → vehicles |
| maintenance_type | string | e.g. "oil_change" |
| description | string(400) | details |
| date | datetime | scheduled date |
| estimated_cost | float | |
| workshop | string | nullable |
| status | string | pending / approved / rejected / completed |

## Setup

```bash
cd backend

# Create .env from example
cp .env.example .env

# Install dependencies (using uv or pip)
uv sync
# or: pip install -e .

# Run
uvicorn app.main:app --reload --port 8000
```

The database (`fleetflow.db`) is auto-created on first run. A manager account is seeded from `.env` credentials.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MANAGER_EMAIL` | Manager login email | (required) |
| `MANAGER_PASSWORD` | Manager login password | (required) |
| `DATABASE_URL` | SQLAlchemy connection string | `sqlite:///./fleetflow.db` |

## Request Flow

```
Client → Header: token → dependencies.py (get_current_user / manager_required)
       → API route → service layer → SQLAlchemy model → SQLite
```

All authenticated endpoints expect a `token` header. The dependency chain validates the token against the in-memory session store, loads the user from DB, and optionally checks for manager role.

## API Docs

FastAPI auto-generates interactive docs at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
