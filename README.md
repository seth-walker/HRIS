# HRIS - Human Resource Information System

A modern, lightweight HRIS application built for small to mid-sized organizations. This full-stack TypeScript application provides comprehensive employee and team management with role-based access control.

![Tech Stack](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![NestJS](https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

## Features

### Core Functionality
- **Employee Management** - Complete CRUD operations for employee records
- **Team Directory** - Hierarchical team structure with sub-teams support
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
- **TailwindCSS** - Utility-first CSS framework
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
│   │   ├── guards/         # Authentication guards
│   │   └── seed.ts         # Database seeding
│   └── package.json
│
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── context/        # React context
│   └── package.json
│
└── SETUP.md               # Setup instructions
```

## API Documentation

### Authentication
```
POST /api/auth/login
POST /api/auth/register
```

### Employees
```
GET    /api/employees              # List employees
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
- [ ] Custom Report Builder (Phase 2.1)

### Phase 3: Enhanced Features (Future)
- [ ] Performance Reviews
- [ ] Time-off Management
- [ ] Document Management
- [ ] Notifications System

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ for modern HR teams**
