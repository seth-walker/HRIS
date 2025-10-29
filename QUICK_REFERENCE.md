# HRIS Quick Reference Guide

## Common Commands

### Development

#### Start Backend
```bash
cd backend
npm run start:dev
```

#### Start Frontend
```bash
cd frontend
npm run dev
```

#### Seed Database
```bash
cd backend
npm run seed
```

#### Build for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

#### Run Tests
```bash
# Backend - All tests
cd backend
npm test

# Backend - With coverage
npm run test:cov

# Backend - Watch mode
npm run test:watch

# Backend - E2E tests
npm run test:e2e

# Frontend - All tests
cd frontend
npm test

# Frontend - With coverage
npm run test:coverage

# Frontend - With UI
npm run test:ui
```

## Test Credentials

| Role     | Email                           | Password    |
|----------|---------------------------------|-------------|
| Admin    | admin@hris.com                  | admin123    |
| HR       | hr@hris.com                     | hr123       |
| Manager  | emily.rodriguez@company.com     | manager123  |
| Employee | david.kim@company.com           | employee123 |

## API Endpoints Reference

### Authentication
```bash
# Login
POST /api/auth/login
Body: { "email": "admin@hris.com", "password": "admin123" }

# Register
POST /api/auth/register
Body: { "email": "new@example.com", "password": "pass123", "roleId": "uuid" }
Headers: Authorization: Bearer <token>
```

### Employees
```bash
# List all employees
GET /api/employees
Headers: Authorization: Bearer <token>

# Search employees
GET /api/employees?search=John&department=Engineering
Headers: Authorization: Bearer <token>

# Get single employee
GET /api/employees/:id
Headers: Authorization: Bearer <token>

# Create employee
POST /api/employees
Headers: Authorization: Bearer <token>
Body: {
  "firstName": "John",
  "lastName": "Doe",
  "title": "Software Engineer",
  "department": "Engineering",
  "email": "john@company.com",
  "hireDate": "2024-01-15",
  "salary": 100000
}

# Update employee
PUT /api/employees/:id
Headers: Authorization: Bearer <token>
Body: { "title": "Senior Software Engineer" }

# Delete employee
DELETE /api/employees/:id
Headers: Authorization: Bearer <token>

# Get org chart
GET /api/employees/org-chart
Headers: Authorization: Bearer <token>

# Bulk import
POST /api/employees/bulk-import
Headers: Authorization: Bearer <token>
Body: [ {...employee1}, {...employee2} ]
```

### Teams
```bash
# List all teams
GET /api/teams
Headers: Authorization: Bearer <token>

# Search teams
GET /api/teams?search=Engineering
Headers: Authorization: Bearer <token>

# Get team
GET /api/teams/:id
Headers: Authorization: Bearer <token>

# Create team
POST /api/teams
Headers: Authorization: Bearer <token>
Body: {
  "name": "DevOps",
  "description": "Infrastructure team",
  "leadId": "employee-uuid",
  "parentTeamId": "parent-team-uuid"
}

# Update team
PUT /api/teams/:id
Headers: Authorization: Bearer <token>
Body: { "description": "Updated description" }

# Delete team
DELETE /api/teams/:id
Headers: Authorization: Bearer <token>

# Get team hierarchy
GET /api/teams/hierarchy
Headers: Authorization: Bearer <token>
```

### Users
```bash
# List all users (Admin/HR only)
GET /api/users
Headers: Authorization: Bearer <token>

# Get roles (Admin only)
GET /api/users/roles
Headers: Authorization: Bearer <token>

# Update user role (Admin only)
PUT /api/users/:id/role
Headers: Authorization: Bearer <token>
Body: { "roleId": "role-uuid" }

# Toggle user active status (Admin only)
PUT /api/users/:id/toggle-active
Headers: Authorization: Bearer <token>
```

### Audit Logs
```bash
# Get audit logs (Admin/HR only)
GET /api/audit-logs
Headers: Authorization: Bearer <token>

# Filter audit logs
GET /api/audit-logs?entityType=Employee&action=update&startDate=2024-01-01
Headers: Authorization: Bearer <token>

# Get entity history
GET /api/audit-logs/entity?entityType=Employee&entityId=uuid
Headers: Authorization: Bearer <token>
```

## Database Commands

### PostgreSQL Access
```bash
# Connect to database
psql -U hris_user -d hris_db -h localhost

# List tables
\dt

# Describe table
\d employees

# Query examples
SELECT * FROM employees LIMIT 10;
SELECT * FROM users WHERE email = 'admin@hris.com';

# Exit
\q
```

### Backup Database
```bash
pg_dump -U hris_user -h localhost hris_db > backup.sql
```

### Restore Database
```bash
psql -U hris_user -h localhost hris_db < backup.sql
```

### Reset Database
```bash
# Drop and recreate database
psql postgres
DROP DATABASE hris_db;
CREATE DATABASE hris_db;
GRANT ALL PRIVILEGES ON DATABASE hris_db TO hris_user;
\q

# Reseed
cd backend
npm run seed
```

## Environment Variables

### Backend (.env)
```bash
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=hris_user
DB_PASSWORD=password123
DB_DATABASE=hris_db

PORT=3000
NODE_ENV=development

JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=24h

CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3000/api
```

## Troubleshooting

### Backend won't start
```bash
# Check if PostgreSQL is running
# macOS
brew services list

# Linux
sudo systemctl status postgresql

# Check logs
cd backend
npm run start:dev 2>&1 | tee error.log
```

### Database connection failed
```bash
# Test connection
psql -U hris_user -d hris_db -h localhost

# If password wrong, reset it
psql postgres
ALTER USER hris_user WITH PASSWORD 'new_password';
```

### Port already in use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in backend/.env
PORT=3001
```

### Frontend can't connect to API
```bash
# Check backend is running
curl http://localhost:3000/api/auth/login

# Check CORS settings
# backend/.env: CORS_ORIGIN should match frontend URL

# Check frontend .env
# VITE_API_URL should point to backend
```

### Clear all data and restart
```bash
# Reset database
psql postgres
DROP DATABASE hris_db;
CREATE DATABASE hris_db;
GRANT ALL PRIVILEGES ON DATABASE hris_db TO hris_user;
\q

# Reseed
cd backend
npm run seed

# Restart backend
npm run start:dev

# Clear browser storage
# Open DevTools > Application > Clear storage
```

## Role Permissions Quick Reference

### Admin
- ✅ Full system access
- ✅ Manage users and roles
- ✅ All CRUD operations
- ✅ View audit logs
- ✅ Bulk import/export

### HR
- ✅ Manage all employees
- ✅ Manage teams
- ✅ View audit logs
- ✅ Bulk import/export
- ❌ Cannot manage users

### Manager
- ✅ View company directory
- ✅ View/edit direct reports
- ✅ View their team
- ❌ Cannot change salaries
- ❌ Cannot manage teams
- ❌ Cannot see audit logs

### Employee
- ✅ View company directory
- ✅ View org chart
- ✅ View their own profile
- ❌ Cannot edit any records
- ❌ Cannot see salaries
- ❌ Limited access

## File Locations

### Configuration Files
- `backend/.env` - Backend environment variables
- `frontend/.env` - Frontend environment variables
- `backend/tsconfig.json` - TypeScript config for backend
- `frontend/tsconfig.json` - TypeScript config for frontend
- `frontend/tailwind.config.js` - Tailwind CSS config

### Key Source Files
- `backend/src/main.ts` - Backend entry point
- `backend/src/app.module.ts` - Main app module
- `backend/src/seed.ts` - Database seeding script
- `frontend/src/App.tsx` - Frontend entry point
- `frontend/src/main.tsx` - React mount point

### Documentation
- `README.md` - Project overview
- `SETUP.md` - Setup instructions
- `DEPLOYMENT.md` - Deployment guide
- `PROJECT_SUMMARY.md` - Complete project summary
- `DATABASE_SCHEMA.md` - Database documentation
- `QUICK_REFERENCE.md` - This file

## Useful URLs

### Development
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- Database: localhost:5432

### Health Checks
```bash
# Backend health
curl http://localhost:3000/api/auth/login

# Database
psql -U hris_user -d hris_db -h localhost -c "SELECT 1"
```

## NPM Scripts

### Backend
```bash
npm run build          # Build for production
npm run start          # Start production build
npm run start:dev      # Start development mode
npm run start:prod     # Start production mode
npm run seed           # Seed database
```

### Frontend
```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
npm run lint           # Run linter
```

## Git Workflow

```bash
# Initial commit
git add .
git commit -m "Initial HRIS implementation"
git push origin main

# Feature branch
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# Create pull request on GitHub
```

## Support Contacts

- GitHub Issues: [Repository Issues](https://github.com/your-repo/issues)
- Documentation: See markdown files in project root
- Database Schema: See DATABASE_SCHEMA.md
