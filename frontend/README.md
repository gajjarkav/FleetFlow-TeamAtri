# FleetFlow Frontend

React SPA for FleetFlow — fleet management dashboard with separate admin (manager) and driver (dispatcher) interfaces.

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 19 |
| Bundler | Vite 7 |
| Routing | react-router-dom 7 |
| Charts | Recharts |
| Icons | Lucide React |
| Styling | Vanilla CSS (custom properties, glassmorphism, responsive) |

## Project Structure

```
src/
├── main.jsx                    # ReactDOM entry
├── App.jsx                     # Router + route guards
├── index.css                   # Global design system (admin layout, components)
├── auth.css                    # Login page styles
├── driver.css                  # Driver interface styles
├── App.css                     # Root element style
├── context/
│   ├── AuthContext.jsx          # Auth state (login/logout, role)
│   └── MaintenanceContext.jsx   # Shared maintenance state (records, vehicle status)
├── components/
│   ├── Layout.jsx               # Admin shell (sidebar + header + <Outlet />)
│   ├── Sidebar.jsx              # Admin sidebar navigation
│   ├── Header.jsx               # Admin top bar (title, notifications, avatar)
│   ├── DriverLayout.jsx         # Driver shell (top nav + <Outlet />)
│   ├── Modal.jsx                # Reusable modal overlay
│   └── Toast.jsx                # Toast notifications + useToast hook
├── pages/
│   ├── Login.jsx                # Staff login
│   ├── AdminLogin.jsx           # Manager login
│   ├── AccessDenied.jsx         # Role mismatch page
│   ├── Dashboard.jsx            # Admin — KPIs, charts, activity feed
│   ├── Vehicles.jsx             # Admin — vehicle grid + add modal
│   ├── Drivers.jsx              # Admin — driver table + add modal
│   ├── Trips.jsx                # Admin — trip table + dispatch modal
│   ├── Maintenance.jsx          # Admin — maintenance table, bill preview, reimbursement
│   ├── Expenses.jsx             # Admin — expense table + charts
│   ├── Reports.jsx              # Admin — utilization, leaderboards, analytics
│   └── driver/
│       ├── DriverDashboard.jsx  # Driver home — stats, quick actions, maintenance form
│       ├── RideInvitations.jsx  # Accept/decline trip invitations
│       ├── ActiveTrip.jsx       # Live trip tracker with step progress
│       ├── DriverMaintenance.jsx # Submit requests, upload bills, track status
│       └── DriverProfile.jsx    # View/edit profile, license status
├── data/
│   └── mockData.js              # Static seed data (vehicles, drivers, trips, etc.)
└── services/                    # (empty — reserved for API integration)
```

## Routing & Auth

All routing is in `App.jsx`. Four route guards control access:

| Guard | Behavior |
|-------|----------|
| `PublicRoute` | Auth pages (login). Redirects logged-in users to their dashboard. |
| `RequireAuth` | Must be logged in, any role. |
| `AdminRoute` | Must be `admin` role. Others see AccessDenied. |
| `DriverRoute` | Must be `staff` role. Others see AccessDenied. |

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
| `/driver/active-trip` | Driver | Active Trip Tracker |
| `/driver/maintenance` | Driver | Driver Maintenance |
| `/driver/profile` | Driver | Driver Profile |

## Data Layer

Currently uses **mock data only** (`data/mockData.js`). No API calls.

- `AuthContext` — accepts any email/password, assigns role based on which login page is used
- `MaintenanceContext` — in-memory CRUD for maintenance records, shared between admin and driver views
- All other pages use local `useState` initialized from `mockData.js`

### Mock Data Sets

| Export | Records | Used By |
|--------|---------|---------|
| `vehicles` | 8 vehicles | Vehicles, Trips, Maintenance, Dashboard, Reports |
| `drivers` | 7 drivers | Drivers, Trips, Dashboard, Reports, Driver pages |
| `trips` | 8 trips | Trips, Dashboard, Reports, Driver pages |
| `maintenance` | 5 records | Maintenance (via context) |
| `expenses` | 10 records | Expenses |
| `weeklyTrips` | 7 data points | Dashboard bar chart |
| `monthlyExpenses` | 6 months | Expenses stacked bar chart |
| `utilizationData` | 6 months | Reports area chart |

Helper functions: `getVehicleById()`, `getDriverById()`, `getDaysUntilExpiry()`

## Key Features

### Admin Side
- **Dashboard** — stat cards, weekly trip bar chart, fleet status pie chart, activity feed, compliance alerts
- **Vehicles** — card grid view, status filter tabs, search, add vehicle modal with validation
- **Drivers** — table with license expiry color-coding, compliance summary, add driver modal
- **Trips** — dispatch modal with vehicle capacity validation (blocks overweight), toast notifications
- **Maintenance** — table with dual filter (status + reimbursement), bill preview modal, approve/reject buttons
- **Expenses** — KPI cards, monthly stacked bar chart, expense log table
- **Reports** — fleet utilization trend, expense pie chart, top vehicles table, driver performance table

### Driver Side
- **Dashboard** — hero welcome card, KPI stats, quick action grid, inline maintenance request form
- **Ride Invitations** — accept/decline cards with vehicle + cargo details
- **Active Trip** — step-by-step progress tracker (assigned → delivered)
- **Maintenance** — submit requests, upload workshop bills, mark jobs done, track reimbursement
- **Profile** — editable name/contact, license status indicator, trip stats

## CSS Architecture

Three CSS files with a shared design system via CSS custom properties:

| File | Scope |
|------|-------|
| `index.css` | Design tokens (`:root`), admin layout, all shared components, responsive breakpoints |
| `auth.css` | Login pages (staff + admin) |
| `driver.css` | Driver interface (top nav, hero cards, stat cards, trip tracker, etc.) |

### Responsive Breakpoints
- **≤ 1024px** — Narrower sidebar, single-column charts, compact stat cards
- **≤ 768px** — Sidebar becomes fixed overlay with hamburger menu, stacked layouts, bottom-sheet modals, horizontal table scroll
- **≤ 480px** — Single-column stat grid, minimal padding, stacked modal buttons

## Setup

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
```

### Build

```bash
npm run build     # Output: dist/
npm run preview   # Preview production build
```

## Login Credentials

Any email/password works — auth is mocked.

- **Staff login** (`/login`) → enters driver interface
- **Admin login** (`/admin-login`) → enters manager dashboard
