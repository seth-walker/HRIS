# HRIS System - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **npm** or **yarn**
- **Git**

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd HRIS
```

### 2. Database Setup

#### Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

#### Create Database and User

```bash
# Access PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE hris_db;
CREATE USER hris_user WITH ENCRYPTED PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE hris_db TO hris_user;

# Exit psql
\q
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Seed the database with initial data
npm run seed

# Start the backend server
npm run start:dev
```

The backend API will be running at `http://localhost:3000/api`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env if needed (default points to localhost:3000)

# Start the frontend development server
npm run dev
```

The frontend will be running at `http://localhost:5173`

## Test Credentials

After seeding the database, you can log in with these test accounts:

| Role     | Email                           | Password    |
|----------|---------------------------------|-------------|
| Admin    | admin@hris.com                  | admin123    |
| HR       | hr@hris.com                     | hr123       |
| Manager  | emily.rodriguez@company.com     | manager123  |
| Employee | david.kim@company.com           | employee123 |

## Project Structure

```
HRIS/
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── entities/       # TypeORM entities
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/       # Authentication
│   │   │   ├── employees/  # Employee management
│   │   │   ├── teams/      # Team management
│   │   │   ├── users/      # User management
│   │   │   └── audit-log/  # Audit logging
│   │   ├── guards/         # Auth guards
│   │   ├── decorators/     # Custom decorators
│   │   └── seed.ts         # Database seeding script
│   ├── .env                # Environment variables
│   └── package.json
│
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── context/        # React context
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # Main app component
│   ├── .env                # Environment variables
│   └── package.json
│
└── README.md
```

## Features Implemented

### Core Features
- ✅ Employee Directory with CRUD operations
- ✅ Team Management with hierarchical structure
- ✅ Role-Based Access Control (Admin, HR, Manager, Employee)
- ✅ Authentication with JWT
- ✅ Interactive Organizational Chart
- ✅ Global Search (Employees & Teams)
- ✅ Audit Logging

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

#### Employees
- `GET /api/employees` - List all employees (with filters)
- `GET /api/employees/:id` - Get employee details
- `POST /api/employees` - Create employee (Admin/HR)
- `PUT /api/employees/:id` - Update employee (Admin/HR/Manager)
- `DELETE /api/employees/:id` - Delete employee (Admin/HR)
- `GET /api/employees/org-chart` - Get org chart
- `POST /api/employees/bulk-import` - Bulk import (Admin/HR)

#### Teams
- `GET /api/teams` - List all teams
- `GET /api/teams/:id` - Get team details
- `POST /api/teams` - Create team (Admin/HR)
- `PUT /api/teams/:id` - Update team (Admin/HR)
- `DELETE /api/teams/:id` - Delete team (Admin/HR)
- `GET /api/teams/hierarchy` - Get team hierarchy

#### Audit Logs
- `GET /api/audit-logs` - Get audit logs (Admin/HR)

## Development

### Backend Development

```bash
cd backend

# Run in development mode with hot-reload
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod
```

### Frontend Development

```bash
cd frontend

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Verify PostgreSQL is running:
   ```bash
   # macOS
   brew services list

   # Linux
   sudo systemctl status postgresql
   ```

2. Check database credentials in `backend/.env`

3. Ensure the database exists:
   ```bash
   psql -U hris_user -d hris_db -h localhost
   ```

### Port Already in Use

If port 3000 or 5173 is already in use:

**Backend:**
Change `PORT` in `backend/.env`

**Frontend:**
Vite will automatically use the next available port, or you can specify in `vite.config.ts`

### CORS Issues

If you encounter CORS errors, verify that `CORS_ORIGIN` in `backend/.env` matches your frontend URL.

## Next Steps

For additional features like data import/export and advanced reporting, refer to:
- [User Guide](./docs/USER_GUIDE.md) - Coming soon
- [Admin Guide](./docs/ADMIN_GUIDE.md) - Coming soon

## License

MIT
