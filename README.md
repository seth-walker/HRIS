# HRIS - Human Resource Information System

A modern, full-stack HRIS application built for small to mid-sized organizations. This TypeScript application provides comprehensive employee and team management with role-based access control.

![Tech Stack](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![NestJS](https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

## Features

### Core Functionality
- **Employee Management** - Complete CRUD operations with manager assignments
- **Team Directory** - Hierarchical team structure with team leads
- **Organizational Chart** - Interactive visualization of reporting relationships
- **Global Search** - System-wide search across employees and teams
- **Role-Based Access Control** - Four distinct user roles (Admin, HR, Manager, Employee)
- **Audit Logging** - Comprehensive change tracking for compliance
- **CSV Import** - Bulk import employees with validation and error reporting
- **Excel Export** - Professional exports with formatting for employees and teams
- **PDF Export** - Generate reports and org charts for printing
- **Advanced Filtering** - Filter and sort by multiple criteria

### Role Permissions

| Feature | Admin | HR | Manager | Employee |
|---------|-------|-----|---------|----------|
| View All Employees | ✅ | ✅ | ❌* | ✅ |
| Edit Employees | ✅ | ✅ | ✅** | ❌ |
| Manage Teams | ✅ | ✅ | ❌ | ❌ |
| Bulk Import/Export | ✅ | ✅ | ❌ | ❌ |
| View Audit Logs | ✅ | ✅ | ❌ | ❌ |
| User Management | ✅ | ❌ | ❌ | ❌ |


## Technology Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for TypeScript and JavaScript
- **PostgreSQL** - Relational database
- **JWT** - Secure authentication
- **Passport** - Authentication middleware

### Frontend
- **React 18** - UI library
- **Vite** - Next generation frontend tooling
- **TypeScript** - Type-safe development
- **TailwindCSS v4** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Axios** - HTTP client

## Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL v14+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd HRIS

# Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run seed
npm run start:dev

# Setup frontend (in a new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

The backend will run on `http://localhost:3000` and the frontend on `http://localhost:5173`.

Visit `http://localhost:5173` and log in with test credentials:
- **Admin:** admin@hris.com / admin123
- **HR:** hr@hris.com / hr123
- **Manager:** emily.rodriguez@company.com / manager123
- **Employee:** david.kim@company.com / employee123

For detailed setup instructions, see [SETUP.md](./SETUP.md)

### Environment Variables

#### Backend (.env)
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_HOST` | PostgreSQL host | localhost | ✅ |
| `DATABASE_PORT` | PostgreSQL port | 5432 | ✅ |
| `DATABASE_USER` | Database username | postgres | ✅ |
| `DATABASE_PASSWORD` | Database password | - | ✅ |
| `DATABASE_NAME` | Database name | hris | ✅ |
| `JWT_SECRET` | Secret key for JWT tokens | - | ✅ |
| `JWT_EXPIRATION` | Token expiration time | 24h | ❌ |
| `PORT` | Backend server port | 3000 | ❌ |

#### Frontend (.env)
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | http://localhost:3000/api | ✅ |

## Project Structure

```
HRIS/
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── entities/       # Database entities
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/       # Authentication
│   │   │   ├── employees/  # Employee management
│   │   │   ├── teams/      # Team management
│   │   │   ├── import-export/  # CSV/Excel/PDF operations
│   │   │   └── audit-log/  # Audit logging
│   │   ├── guards/         # Authentication guards
│   │   └── seed.ts         # Database seeding
│   └── package.json
│
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Employees.tsx
│   │   │   ├── Teams.tsx
│   │   │   └── ImportExport.tsx
│   │   ├── services/       # API services
│   │   └── context/        # React context
│   └── package.json
│
├── SETUP.md               # Setup instructions
├── DEPLOYMENT.md          # Deployment guide
├── TESTING.md             # Testing guide
└── QUICK_REFERENCE.md     # Quick command reference
```

## API Documentation

### Authentication
```
POST /api/auth/login
POST /api/auth/register
```

### Employees
```
GET    /api/employees              # List employees (with filters)
GET    /api/employees/:id          # Get employee
POST   /api/employees              # Create employee
PUT    /api/employees/:id          # Update employee
DELETE /api/employees/:id          # Delete employee
GET    /api/employees/org-chart    # Get org chart
POST   /api/employees/bulk-import  # Bulk import
```

### Teams
```
GET    /api/teams            # List teams
GET    /api/teams/:id        # Get team
POST   /api/teams            # Create team
PUT    /api/teams/:id        # Update team
DELETE /api/teams/:id        # Delete team
GET    /api/teams/hierarchy  # Get hierarchy
```

### Import/Export
```
POST /api/import-export/import/csv              # Upload CSV
GET  /api/import-export/export/employees/excel  # Export to Excel
GET  /api/import-export/export/employees/pdf    # Export to PDF
GET  /api/import-export/export/org-chart/pdf    # Export org chart
GET  /api/import-export/template/csv            # Download template
```

## Development Roadmap

### Phase 1: Core Features ✅
- [x] Employee CRUD
- [x] Team Management
- [x] Authentication & RBAC
- [x] Organizational Chart
- [x] Global Search
- [x] Audit Logging

### Phase 2: Data Management ✅
- [x] CSV Import with validation
- [x] Excel Export (employees & teams)
- [x] PDF Export (employees & org chart)
- [x] Advanced Filtering & Sorting
- [x] CSV Template Download
- [x] Manager assignment
- [x] Team member management


## Testing

```bash
# Backend tests
cd backend
npm test                  # Run all tests
npm run test:cov          # With coverage
npm run test:watch        # Watch mode

# Frontend tests
cd frontend
npm test                  # Run tests
npm run test:coverage     # With coverage
npm run test:ui           # Visual UI
```

See [TESTING.md](./TESTING.md) for comprehensive testing guide.

## Troubleshooting

### Common Issues

#### Backend won't start
**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:5432`
**Solution:** Ensure PostgreSQL is running:
```bash
# macOS (Homebrew)
brew services start postgresql@14

# Linux
sudo systemctl start postgresql

# Check status
psql --version
```

#### Database connection fails
**Problem:** `password authentication failed for user "postgres"`
**Solution:**
1. Verify your `.env` credentials match your PostgreSQL setup
2. Reset PostgreSQL password if needed:
```bash
psql postgres
ALTER USER postgres PASSWORD 'your_password';
```

#### Seed script fails
**Problem:** `QueryFailedError: duplicate key value`
**Solution:** Drop and recreate the database:
```bash
# Drop existing database
psql -U postgres -c "DROP DATABASE hris;"
# Recreate and seed
psql -U postgres -c "CREATE DATABASE hris;"
npm run seed
```

#### Frontend can't reach backend
**Problem:** Network errors or 404 responses
**Solution:**
1. Verify backend is running on port 3000
2. Check `VITE_API_URL` in frontend `.env`:
```bash
VITE_API_URL=http://localhost:3000/api
```
3. Restart frontend dev server after changing `.env`

#### Port already in use
**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`
**Solution:**
```bash
# macOS/Linux - Find and kill the process
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

#### Email validation errors
**Problem:** `ConflictException: Employee with email already exists`
**Solution:** The system now enforces unique emails. Either:
1. Use a different email for the new employee
2. Update the existing employee instead of creating a new one
3. Set email to null if the employee doesn't need one

#### Circular manager reference
**Problem:** `BadRequestException: Circular manager reference detected`
**Solution:** An employee cannot be in their own management chain. Check that:
1. Employee is not their own manager
2. The manager hierarchy doesn't form a loop (A→B→C→A)
3. Update the manager assignment to break the cycle

### Performance Issues

If experiencing slow queries or high memory usage:
1. Check database indexes are created (they're created automatically via TypeORM)
2. Limit result sets using filters
3. Monitor with:
```bash
# Backend logs
cd backend && npm run start:dev

# Database query performance
psql -U postgres hris
EXPLAIN ANALYZE SELECT * FROM employees;
```

## FAQ

### General Questions

**Q: Can I use this in production?**
A: This HRIS is a demonstration project. For production use, you should:
- Add comprehensive security audits
- Implement rate limiting
- Set up proper backup strategies
- Configure HTTPS and secure headers
- Review and enhance authentication flows
- Add monitoring and logging

**Q: What databases are supported?**
A: Currently PostgreSQL 14+. TypeORM theoretically supports MySQL, MariaDB, and SQLite, but they haven't been tested.

**Q: Can I customize the roles?**
A: Yes! Modify `src/entities/role.entity.ts` and update the guards in `src/guards/`. You'll need to update the seed data as well.

**Q: How do I add custom employee fields?**
A:
1. Add fields to `backend/src/entities/employee.entity.ts`
2. Add fields to `frontend/src/types/index.ts`
3. Update DTOs in `backend/src/modules/employees/dto/`
4. Update the frontend forms
5. Run migrations if needed

### Feature Questions

**Q: Can employees have multiple managers?**
A: No, the current design supports a single direct manager per employee. For matrix organizations, consider using Teams for the secondary reporting structure.

**Q: How do I filter exports?**
A: Use the Export Filters panel on the Import/Export page. Select department, status, team, manager, or title filters before exporting.

**Q: Can I export filtered data?**
A: Yes! Filters applied on the Search page and Import/Export page are respected in Excel and PDF exports.

**Q: Is there a maximum employee count?**
A: No hard limit, but performance may degrade with 10,000+ employees without optimization. Consider adding pagination for large datasets.

**Q: How do I backup data?**
A: Use PostgreSQL backup tools:
```bash
# Backup
pg_dump -U postgres hris > backup.sql

# Restore
psql -U postgres hris < backup.sql
```

### Development Questions

**Q: How do I add a new API endpoint?**
A:
1. Add method to service (`*.service.ts`)
2. Add controller endpoint (`*.controller.ts`)
3. Add frontend service method
4. Use React Query to call it

**Q: How do I run tests?**
A: See the Testing section above and [TESTING.md](./TESTING.md) for details.

**Q: Can I use a different frontend framework?**
A: Yes! The backend is framework-agnostic. You can rebuild the frontend with Vue, Angular, or Svelte using the same API.

**Q: How do I add authentication with Google/Microsoft?**
A: Integrate Passport.js strategies. See [NestJS Passport documentation](https://docs.nestjs.com/recipes/passport).

## Documentation

- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [FEATURES.md](./FEATURES.md) - Complete features documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide
- [TESTING.md](./TESTING.md) - Testing guide and best practices
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Command reference
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database structure


### Development Guidelines
- **Code Style**: Follow existing TypeScript conventions
- **Commits**: Use clear, descriptive commit messages
- **Tests**: Maintain or improve code coverage
- **Documentation**: Update README and relevant docs
- **Types**: Ensure full TypeScript type safety

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ for modern HR teams**
