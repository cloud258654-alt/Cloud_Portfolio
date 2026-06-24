# Parking Fee Management System

Parking Fee Management System is a React, Express, and Prisma MVP for managing parking lot operations. It includes admin login, vehicle entry and exit flows, QR payment simulation, dashboard metrics, reservations, discount codes, monthly cars, blacklist handling, LPR simulation, and exception tracking.

## Live Demo

Full live demo requires both the Vite frontend and the Express API server.

- Local full demo: `http://127.0.0.1:5173/`
- API server: `http://127.0.0.1:4000/`
- Public hosted demo: not deployed yet

To run the local demo:

```bash
npm install
npm run db:setup
npm run prisma:seed
npm run dev
```

Default admin account:

```text
Username: admin
Password: admin123
```

## Features

- Admin authentication with JWT
- Parking lot dashboard with occupancy, revenue, entries, exits, and exception metrics
- Vehicle entry and exit workflow
- Fee calculation with free minutes, hourly rate, daily maximum, monthly cars, and VIP vehicles
- QR payment simulation
- Discount code management
- Monthly car management and renewal
- Reservation management
- Blacklist and exception event tracking
- LPR scan simulation
- English / Chinese interface switching
- CSV export for payment records

## Tech Stack

- Frontend: React 18, Vite, Tailwind CSS, lucide-react
- Backend: Express, Prisma, SQLite
- Auth: JWT, bcryptjs
- Testing: Node.js test runner

## Scripts

```bash
npm run dev                 # Start frontend and backend in development mode
npm run client:dev          # Start Vite only
npm run server:dev          # Start Express API with nodemon
npm run build               # Build frontend assets
npm run preview             # Preview production frontend build
npm run server              # Start Express API
npm test                    # Run unit tests
npm run db:setup            # Create/update local SQLite schema
npm run prisma:seed         # Seed default admin and base settings
npm run prisma:generate     # Generate Prisma client
npm run prisma:migrate      # Run Prisma development migrations
```

## Environment

Create a `.env` file from `.env.example`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="change-this-in-local-development"
CORS_ORIGIN="http://127.0.0.1:5173"
PORT=4000
```

For production, set a strong `JWT_SECRET` and use managed secrets instead of committing credentials.

## Testing

```bash
npm test
npm run build
```

Current unit coverage includes the parking fee calculation rules.

## Deployment Notes

This app is not a static-only site. A public demo needs:

- A built frontend hosted on a static host or CDN
- The Express API deployed on a Node.js host
- A production database such as PostgreSQL, MySQL, or MariaDB
- Proper production values for `DATABASE_URL`, `JWT_SECRET`, and `CORS_ORIGIN`

SQLite is suitable for local development, but PostgreSQL or MySQL is recommended for production use.
