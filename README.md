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

*Managers can only view their direct reports
**Managers can only edit their direct reports (excluding salary)

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

Visit `http://localhost:5173` and log in with test credentials:
- **Admin:** admin@hris.com / admin123
- **HR:** hr@hris.com / hr123
- **Manager:** emily.rodriguez@company.com / manager123
- **Employee:** david.kim@company.com / employee123

For detailed setup instructions, see [SETUP.md](./SETUP.md)

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

### Phase 3: Enhanced Features (Future)
- [ ] Performance Reviews
- [ ] Time-off Management
- [ ] Document Management
- [ ] Notifications System
- [ ] Custom Report Builder
- [ ] Scheduled Exports

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

## Documentation

- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [FEATURES.md](./FEATURES.md) - Complete features documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide
- [TESTING.md](./TESTING.md) - Testing guide and best practices
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Command reference
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database structure

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ for modern HR teams**
