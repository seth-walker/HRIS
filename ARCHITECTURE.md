# HRIS Application - Software Architecture

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [High-Level Architecture](#high-level-architecture)
3. [Technology Stack](#technology-stack)
4. [Backend Architecture](#backend-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [Database Architecture](#database-architecture)
7. [Security Architecture](#security-architecture)
8. [API Design](#api-design)
9. [Data Flow](#data-flow)
10. [Design Patterns](#design-patterns)
11. [Directory Structure](#directory-structure)
12. [Dependencies](#dependencies)

---

## Executive Summary

The HRIS (Human Resource Information System) is a full-stack web application built using a modern, scalable architecture following industry best practices. The application uses a **client-server architecture** with a clear separation of concerns between the frontend and backend.

**Architecture Type:** Three-Tier Architecture (Presentation, Business Logic, Data)

**Architectural Style:** REST API with MVC-inspired patterns

**Key Characteristics:**
- ✅ Separation of Concerns
- ✅ Type-Safe (TypeScript throughout)
- ✅ Scalable and Maintainable
- ✅ Role-Based Access Control (RBAC)
- ✅ RESTful API Design
- ✅ Relational Database with ORM

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  React Single Page Application (SPA)                      │  │
│  │  • React 19 + TypeScript                                  │  │
│  │  • Vite Build Tool                                        │  │
│  │  • TailwindCSS Styling                                    │  │
│  │  • React Router (Client-side routing)                     │  │
│  │  • React Query (Server state management)                  │  │
│  │  • Axios (HTTP client)                                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│                      HTTP REST API (JSON)                       │
│                              ↓                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  NestJS REST API Server                                   │  │
│  │  • NestJS 11 Framework                                    │  │
│  │  • Express.js (HTTP server)                               │  │
│  │  • Passport.js (Authentication)                           │  │
│  │  • JWT Strategy (Token-based auth)                        │  │
│  │  • TypeORM (ORM)                                          │  │
│  │                                                            │  │
│  │  Modules (Domain-Driven):                                 │  │
│  │  ├─ AuthModule        (Login/Register)                    │  │
│  │  ├─ UsersModule       (User management)                   │  │
│  │  ├─ EmployeesModule   (Employee CRUD)                     │  │
│  │  ├─ TeamsModule       (Team management)                   │  │
│  │  ├─ AuditLogModule    (Change tracking)                   │  │
│  │  └─ ImportExportModule (CSV/Excel/PDF)                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│                      SQL Queries (TypeORM)                      │
│                              ↓                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL 14+ Database                                  │  │
│  │  • Relational data model                                  │  │
│  │  • ACID transactions                                      │  │
│  │  • Foreign key constraints                                │  │
│  │  • UUID primary keys                                      │  │
│  │                                                            │  │
│  │  Tables:                                                   │  │
│  │  ├─ roles           (4 system roles)                      │  │
│  │  ├─ users           (Authentication accounts)             │  │
│  │  ├─ employees       (Employee records)                    │  │
│  │  ├─ teams           (Hierarchical teams)                  │  │
│  │  └─ audit_logs      (Compliance tracking)                 │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Runtime** | Node.js | 18+ | JavaScript runtime environment |
| **Framework** | NestJS | 11.1.8 | Progressive Node.js framework |
| **Web Server** | Express.js | - | HTTP server (via NestJS) |
| **Language** | TypeScript | 5.9.3 | Type-safe JavaScript |
| **ORM** | TypeORM | 0.3.27 | Object-Relational Mapping |
| **Database** | PostgreSQL | 14+ | Relational database |
| **Authentication** | Passport.js | 0.7.0 | Authentication middleware |
| **JWT** | @nestjs/jwt | 11.0.1 | JSON Web Tokens |
| **Password Hashing** | bcrypt | 6.0.0 | Secure password hashing |
| **Validation** | class-validator | 0.14.2 | DTO validation |
| **Transformation** | class-transformer | 0.5.1 | Object transformation |
| **Excel Generation** | ExcelJS | 4.4.0 | Excel file creation |
| **PDF Generation** | PDFKit | 0.17.2 | PDF document creation |
| **CSV Processing** | csv-parser, csv-writer | - | CSV import/export |
| **File Upload** | Multer | 2.0.2 | Multipart form data |
| **Testing** | Jest | 30.2.0 | Unit & integration testing |

### Frontend Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | React | 19.1.1 | UI library |
| **Language** | TypeScript | 5.9.3 | Type-safe JavaScript |
| **Build Tool** | Vite | 7.1.7 | Fast build tool & dev server |
| **Routing** | React Router | 7.9.5 | Client-side routing |
| **State Management** | React Query (TanStack) | 5.90.5 | Server state management |
| **HTTP Client** | Axios | 1.13.1 | Promise-based HTTP client |
| **Styling** | TailwindCSS | 4.1.16 | Utility-first CSS framework |
| **UI Components** | Headless UI | 2.2.9 | Unstyled components |
| **Icons** | React Icons | 5.5.0 | Icon library |
| **Testing** | Vitest | 4.0.5 | Fast unit testing |
| **Testing Library** | React Testing Library | 16.3.0 | Component testing |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Git** | Version control |
| **npm** | Package management |
| **ESLint** | Code linting |
| **TypeScript Compiler** | Type checking |
| **Jest/Vitest** | Testing frameworks |

---

## Backend Architecture

### Architectural Pattern: Modular Monolith

NestJS follows a **modular architecture** where each feature is encapsulated in its own module with clear boundaries.

### Module Structure

```
backend/src/
├── main.ts                    # Application entry point
├── app.module.ts              # Root module (imports all feature modules)
│
├── entities/                  # Database entities (TypeORM)
│   ├── user.entity.ts         # User authentication
│   ├── role.entity.ts         # RBAC roles
│   ├── employee.entity.ts     # Employee records
│   ├── team.entity.ts         # Team hierarchy
│   └── audit-log.entity.ts    # Change tracking
│
├── modules/                   # Feature modules (domain-driven)
│   ├── auth/                  # Authentication & Authorization
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── local.strategy.ts    # Email/password auth
│   │   │   └── jwt.strategy.ts      # JWT validation
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── register.dto.ts
│   │
│   ├── employees/             # Employee management
│   │   ├── employees.module.ts
│   │   ├── employees.controller.ts
│   │   ├── employees.service.ts
│   │   └── dto/
│   │       ├── create-employee.dto.ts
│   │       └── update-employee.dto.ts
│   │
│   ├── teams/                 # Team management
│   ├── users/                 # User management
│   ├── audit-log/             # Audit logging
│   └── import-export/         # Data import/export
│
├── guards/                    # Authorization guards
│   ├── jwt-auth.guard.ts      # JWT validation
│   └── roles.guard.ts         # Role-based access control
│
├── decorators/                # Custom decorators
│   ├── current-user.decorator.ts  # Extract user from request
│   └── roles.decorator.ts         # Mark required roles
│
└── seed.ts                    # Database seeding script
```

### NestJS Module Architecture

Each feature module follows the same structure:

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([Entity]), // Register entities
    // Other module dependencies
  ],
  controllers: [FeatureController],     // HTTP endpoints
  providers: [FeatureService],          // Business logic
  exports: [FeatureService],            // Make available to other modules
})
export class FeatureModule {}
```

### Layered Architecture Within Modules

```
┌─────────────────────────────────────────┐
│         Controller Layer                │
│  • HTTP endpoints (routes)              │
│  • Request/Response handling            │
│  • DTO validation                       │
│  • Guards & decorators                  │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│         Service Layer                   │
│  • Business logic                       │
│  • Data processing                      │
│  • Validation rules                     │
│  • Transaction management               │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│         Repository Layer (TypeORM)      │
│  • Database queries                     │
│  • Entity management                    │
│  • Relations handling                   │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│         Database (PostgreSQL)           │
└─────────────────────────────────────────┘
```

### Key Backend Components

#### 1. Controllers
Handle HTTP requests and responses:
```typescript
@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @Roles(RoleName.ADMIN, RoleName.HR, RoleName.MANAGER, RoleName.EMPLOYEE)
  async findAll(@CurrentUser() user: User, @Query() filters: any) {
    return this.employeesService.findAll(user, filters);
  }
}
```

#### 2. Services
Contain business logic:
```typescript
@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async findAll(user: any, filters?: any): Promise<Employee[]> {
    // Business logic here
  }
}
```

#### 3. Entities (Models)
Define database schema using TypeORM decorators:
```typescript
@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @ManyToOne(() => Employee, employee => employee.directReports)
  manager: Employee;

  @OneToMany(() => Employee, employee => employee.manager)
  directReports: Employee[];
}
```

#### 4. DTOs (Data Transfer Objects)
Define and validate API request/response shapes:
```typescript
export class CreateEmployeeDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
```

#### 5. Guards
Protect routes with authentication and authorization:
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Check if user has required role
  }
}
```

---

## Frontend Architecture

### Architectural Pattern: Component-Based Architecture

React application following a **component-based architecture** with unidirectional data flow.

### Frontend Structure

```
frontend/src/
├── main.tsx                   # React DOM entry point
├── App.tsx                    # Root component with routing
│
├── components/                # Reusable UI components
│   ├── Layout.tsx             # Main application layout
│   └── Layout.test.tsx        # Component tests
│
├── pages/                     # Route-level page components
│   ├── Login.tsx              # Authentication page
│   ├── Employees.tsx          # Employee directory
│   ├── Teams.tsx              # Team management
│   ├── Search.tsx             # Global search
│   ├── OrgChart.tsx           # Organizational chart
│   ├── ImportExport.tsx       # Data import/export
│   └── AuditLogs.tsx          # Audit log viewer
│
├── context/                   # React Context for global state
│   └── AuthContext.tsx        # Authentication state
│
├── services/                  # API client services
│   ├── api.ts                 # Axios instance & interceptors
│   ├── auth.service.ts        # Auth API calls
│   ├── employee.service.ts    # Employee API calls
│   ├── team.service.ts        # Team API calls
│   ├── audit-log.service.ts   # Audit log API calls
│   └── import-export.service.ts # Import/export API calls
│
├── types/                     # TypeScript type definitions
│   └── index.ts               # Shared interfaces & types
│
├── assets/                    # Static assets (images, fonts)
│
└── test/                      # Test setup and utilities
    └── setup.ts               # Vitest configuration
```

### Component Hierarchy

```
<App>
  <QueryClientProvider>         // React Query provider
    <AuthProvider>              // Authentication context
      <Router>                  // React Router
        <Routes>
          <Route /login>
            <Login />
          </Route>
          <Route /*>
            <PrivateRoute>      // Auth-protected wrapper
              <Layout>          // Shared layout (nav, header)
                <Page />        // Individual page component
              </Layout>
            </PrivateRoute>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  </QueryClientProvider>
</App>
```

### State Management Strategy

The application uses **multiple state management approaches** based on the type of state:

#### 1. Server State (React Query)
For data fetched from API:
```typescript
const { data: employees, isLoading } = useQuery({
  queryKey: ['employees', search],
  queryFn: () => employeeService.getAll({ search }),
});
```

**Benefits:**
- Automatic caching
- Background refetching
- Optimistic updates
- Loading/error states

#### 2. Global State (React Context)
For authentication state:
```typescript
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
  isLoading: true,
});
```

**Benefits:**
- Avoids prop drilling
- Centralized auth logic
- Persistent across routes

#### 3. Local State (useState)
For component-specific state:
```typescript
const [isModalOpen, setIsModalOpen] = useState(false);
const [formData, setFormData] = useState({ ... });
```

**Benefits:**
- Isolated to component
- Simple and performant
- No unnecessary re-renders

### Data Flow Pattern

```
User Interaction
      ↓
Component Event Handler
      ↓
Service Layer (API call via Axios)
      ↓
Backend API
      ↓
Response
      ↓
React Query (cache & state update)
      ↓
Component Re-render (with new data)
```

### Key Frontend Patterns

#### 1. Container/Presentational Pattern
- **Pages** = Smart containers (data fetching, business logic)
- **Components** = Dumb presentational (UI only, props in)

#### 2. Custom Hooks (Composition)
```typescript
const { user, isLoading } = useAuth();  // Authentication hook
```

#### 3. Service Layer Pattern
All API calls abstracted into service files:
```typescript
// services/employee.service.ts
export const employeeService = {
  getAll: (filters) => api.get('/employees', { params: filters }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
};
```

#### 4. Protected Routes
```typescript
const PrivateRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};
```

---

## Database Architecture

### Schema Design

The database follows a **normalized relational model** with clear entity relationships.

### Entity Relationship Diagram (ERD)

```
┌─────────────┐         ┌─────────────┐
│    Roles    │◄───┐    │    Users    │
├─────────────┤    │    ├─────────────┤
│ id (PK)     │    └────┤ roleId (FK) │
│ name        │         │ email       │
│ description │         │ password    │
└─────────────┘         └──────┬──────┘
                               │ 1:1
                               ↓
┌─────────────┐         ┌─────────────┐
│    Teams    │         │  Employees  │
├─────────────┤         ├─────────────┤
│ id (PK)     │◄───┐    │ id (PK)     │
│ name        │    └────┤ teamId (FK) │
│ description │    ┌────┤ managerId   │
│ leadId (FK) ├────┘    │ userId (FK) │
│ parentId    ├─┐       │ firstName   │
└──────┬──────┘ │       │ lastName    │
       │        │       │ title       │
       │ Self-  │       │ department  │
       │ Ref    │       │ email       │
       └────────┘       │ salary      │
                        │ status      │
                        │ hireDate    │
                        └──────┬──────┘
                               │ Self-
                               │ Ref
                               └──────┐
                                      ↓
                               ┌─────────────┐
                               │ Direct      │
                               │ Reports     │
                               └─────────────┘

┌─────────────┐
│ Audit Logs  │
├─────────────┤
│ id (PK)     │
│ userId (FK) │
│ action      │
│ entityType  │
│ entityId    │
│ changes     │
│ timestamp   │
└─────────────┘
```

### Database Tables

#### 1. **roles**
Stores system roles for RBAC.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| name | ENUM | UNIQUE, NOT NULL | Role name (admin, hr, manager, employee) |
| description | TEXT | NULLABLE | Role description |
| createdAt | TIMESTAMP | NOT NULL | Creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | Last update timestamp |

**Relationships:**
- One-to-Many with `users`

#### 2. **users**
Authentication accounts linked to employees.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| email | VARCHAR | UNIQUE, NOT NULL | Login email |
| password | VARCHAR | NOT NULL | Hashed password (bcrypt) |
| isActive | BOOLEAN | DEFAULT true | Account active status |
| roleId | UUID | FOREIGN KEY | Reference to roles table |
| createdAt | TIMESTAMP | NOT NULL | Creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | Last update timestamp |

**Relationships:**
- Many-to-One with `roles`
- One-to-One with `employees`

#### 3. **employees**
Core employee records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| firstName | VARCHAR | NOT NULL | Employee first name |
| lastName | VARCHAR | NOT NULL | Employee last name |
| title | VARCHAR | NOT NULL | Job title |
| department | VARCHAR | NULLABLE | Department name |
| email | VARCHAR | UNIQUE, NULLABLE | Work email |
| phone | VARCHAR | NULLABLE | Phone number |
| hireDate | DATE | NOT NULL | Date of hire |
| salary | DECIMAL(10,2) | NULLABLE | Annual salary |
| status | ENUM | DEFAULT 'active' | Employment status (active, on_leave, terminated) |
| managerId | UUID | FOREIGN KEY, NULLABLE | Self-reference to manager |
| teamId | UUID | FOREIGN KEY, NULLABLE | Reference to teams table |
| userId | UUID | FOREIGN KEY, NULLABLE | Reference to users table |
| createdAt | TIMESTAMP | NOT NULL | Creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | Last update timestamp |

**Relationships:**
- Self-referencing Many-to-One (manager/directReports)
- Many-to-One with `teams`
- One-to-Many with `teams` (as team lead)
- One-to-One with `users`

#### 4. **teams**
Hierarchical team structure.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| name | VARCHAR | NOT NULL | Team name |
| description | TEXT | NULLABLE | Team description |
| leadId | UUID | FOREIGN KEY, NULLABLE | Reference to employees table |
| parentTeamId | UUID | FOREIGN KEY, NULLABLE | Self-reference to parent team |
| createdAt | TIMESTAMP | NOT NULL | Creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | Last update timestamp |

**Relationships:**
- Self-referencing Many-to-One (parent/subTeams)
- One-to-Many with `employees` (team members)
- Many-to-One with `employees` (team lead)

#### 5. **audit_logs**
Tracks all data changes for compliance.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| userId | UUID | FOREIGN KEY | User who performed action |
| action | ENUM | NOT NULL | Action type (CREATE, UPDATE, DELETE, LOGIN, etc.) |
| entityType | VARCHAR | NOT NULL | Type of entity modified |
| entityId | UUID | NULLABLE | ID of entity modified |
| changes | JSONB | NULLABLE | JSON of old/new values |
| ipAddress | VARCHAR | NULLABLE | IP address of request |
| userAgent | VARCHAR | NULLABLE | Browser/client info |
| timestamp | TIMESTAMP | NOT NULL | When action occurred |

**Relationships:**
- Many-to-One with `users`

### Key Database Features

#### 1. UUID Primary Keys
All tables use UUIDs instead of auto-incrementing integers:
- More secure (not predictable)
- Globally unique (distributed systems)
- No collision risk

#### 2. Timestamps
All tables have `createdAt` and `updatedAt`:
- Automatic tracking via TypeORM decorators
- Audit trail for data changes

#### 3. Enums
Type-safe enumerations:
- `RoleName`: admin, hr, manager, employee
- `EmploymentStatus`: active, on_leave, terminated
- `AuditAction`: CREATE, UPDATE, DELETE, IMPORT, EXPORT, LOGIN, LOGOUT

#### 4. Self-Referencing Relationships
- **Employees**: Manager hierarchy (org chart)
- **Teams**: Parent-child hierarchy (team tree)

#### 5. Cascade Behavior
Defined via TypeORM relations:
- Deleting a team doesn't delete employees (set to NULL)
- Deleting a manager doesn't delete direct reports (set to NULL)

---

## Security Architecture

### Multi-Layered Security Approach

```
┌─────────────────────────────────────────────┐
│  1. Input Validation (DTOs)                 │
│     • class-validator decorators             │
│     • Whitelist mode (strip unknown fields)  │
└─────────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│  2. Authentication (Passport.js)            │
│     • JWT tokens                             │
│     • Bcrypt password hashing                │
│     • HttpOnly cookies (optional)            │
└─────────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│  3. Authorization (Guards)                  │
│     • JwtAuthGuard (is user logged in?)     │
│     • RolesGuard (does user have role?)     │
└─────────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│  4. Data Access Control (Service Layer)     │
│     • Filter by user role                    │
│     • Hide sensitive fields (salary)         │
└─────────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│  5. Database Security (TypeORM)             │
│     • Parameterized queries (SQL injection)  │
│     • Connection pooling                     │
└─────────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│  6. Audit Logging                           │
│     • All actions tracked                    │
│     • Immutable log records                  │
└─────────────────────────────────────────────┘
```

### Authentication Flow

```
1. User submits email/password
         ↓
2. AuthService validates credentials
   • Query database for user by email
   • Compare password hash with bcrypt
         ↓
3. Generate JWT token
   • Payload: { userId, email, role }
   • Sign with JWT_SECRET
   • Set expiration (24h default)
         ↓
4. Return token to client
         ↓
5. Client stores token (localStorage)
         ↓
6. Client sends token in Authorization header
   "Authorization: Bearer <token>"
         ↓
7. JwtAuthGuard validates token
   • Verify signature
   • Check expiration
   • Extract user payload
         ↓
8. Request proceeds with user context
```

### Authorization (RBAC) Implementation

#### Role Hierarchy
```
Admin (Full access)
  ↓
HR (Employee & team management)
  ↓
Manager (View/edit direct reports only)
  ↓
Employee (View only)
```

#### Permission Matrix

| Feature | Admin | HR | Manager | Employee |
|---------|-------|-----|---------|----------|
| View all employees | ✅ | ✅ | ❌* | ✅ |
| Create employee | ✅ | ✅ | ❌ | ❌ |
| Edit employee | ✅ | ✅ | ✅** | ❌ |
| Delete employee | ✅ | ✅ | ❌ | ❌ |
| View salary | ✅ | ✅ | ❌ | ❌*** |
| Manage teams | ✅ | ✅ | ❌ | ❌ |
| Import/Export | ✅ | ✅ | ❌ | ❌ |
| View audit logs | ✅ | ✅ | ❌ | ❌ |
| User management | ✅ | ❌ | ❌ | ❌ |

*Manager can view their team only
**Manager can edit direct reports only
***Employee can view own salary only

#### Implementation with Guards

```typescript
// Protect route with authentication
@UseGuards(JwtAuthGuard)

// Require specific roles
@Roles(RoleName.ADMIN, RoleName.HR)
@UseGuards(JwtAuthGuard, RolesGuard)
```

### Password Security

1. **Hashing**: bcrypt with automatic salt (10 rounds)
2. **No plain text storage**: Passwords never stored in plain text
3. **Validation**: (Would add) Password complexity requirements

### Token Security

1. **JWT signed with secret**: Tamper-proof
2. **Short expiration**: 24h default (configurable)
3. **Stateless**: No server-side session storage
4. **Would add**: Refresh tokens for extended sessions

### CORS Configuration

```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
});
```

---

## API Design

### RESTful API Conventions

The API follows REST principles with resource-based URLs.

### API Structure

```
Base URL: http://localhost:3000/api

/api
├── /auth
│   ├── POST   /login              # Authenticate user
│   └── POST   /register           # Register new user (Admin only)
│
├── /employees
│   ├── GET    /                   # List employees (with filters)
│   ├── GET    /:id                # Get single employee
│   ├── GET    /org-chart          # Get organizational hierarchy
│   ├── GET    /:id/direct-reports # Get employee's reports
│   ├── POST   /                   # Create employee
│   ├── POST   /bulk-import        # Bulk import employees
│   ├── PUT    /:id                # Update employee
│   └── DELETE /:id                # Delete employee
│
├── /teams
│   ├── GET    /                   # List teams
│   ├── GET    /:id                # Get single team
│   ├── GET    /hierarchy          # Get team hierarchy
│   ├── POST   /                   # Create team
│   ├── PUT    /:id                # Update team
│   └── DELETE /:id                # Delete team
│
├── /users
│   ├── GET    /                   # List users (Admin/HR)
│   ├── GET    /roles              # Get available roles
│   ├── PUT    /:id/role           # Update user role
│   └── PUT    /:id/toggle-active  # Activate/deactivate user
│
├── /audit-logs
│   ├── GET    /                   # List audit logs (with filters)
│   └── GET    /entity             # Get entity change history
│
└── /import-export
    ├── POST   /import/csv         # Import employees from CSV
    ├── GET    /export/employees/excel # Export employees to Excel
    ├── GET    /export/employees/pdf   # Export employees to PDF
    ├── GET    /export/org-chart/pdf   # Export org chart to PDF
    └── GET    /template/csv       # Download CSV template
```

### API Request/Response Patterns

#### Standard Success Response
```json
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  ...
}
```

#### Standard Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

#### List Response (with filters)
```json
[
  { "id": "uuid1", ... },
  { "id": "uuid2", ... }
]
```

#### Bulk Operation Response
```json
{
  "created": 5,
  "updated": 2,
  "errors": []
}
```

### Query Parameters (Filtering)

```
GET /api/employees?department=Engineering&status=active&search=john&sortBy=lastName&sortOrder=ASC
```

Supported filters:
- `department`: Filter by department
- `status`: Filter by employment status
- `title`: Search in title
- `search`: Full-text search (name, email, title)
- `teamId`: Filter by team
- `managerId`: Filter by manager
- `sortBy`: Field to sort by
- `sortOrder`: ASC or DESC

---

## Data Flow

### Complete Request-Response Cycle

#### Example: Creating an Employee

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. User clicks "Create Employee" button
       │
       ↓
┌─────────────────────────────┐
│  React Component            │
│  (Employees.tsx)            │
└──────┬──────────────────────┘
       │ 2. Form submission triggers mutation
       │
       ↓
┌─────────────────────────────┐
│  React Query                │
│  (useMutation)              │
└──────┬──────────────────────┘
       │ 3. Calls service method
       │
       ↓
┌─────────────────────────────┐
│  Service Layer              │
│  (employee.service.ts)      │
└──────┬──────────────────────┘
       │ 4. HTTP POST with Axios
       │    POST /api/employees
       │    Authorization: Bearer <token>
       │    Body: { firstName, lastName, ... }
       │
       ↓
┌─────────────────────────────┐
│  Backend Middleware         │
│  (NestJS Pipeline)          │
└──────┬──────────────────────┘
       │ 5. Validate JWT token (JwtAuthGuard)
       │ 6. Check user role (RolesGuard)
       │ 7. Validate request body (ValidationPipe)
       │
       ↓
┌─────────────────────────────┐
│  Controller                 │
│  (employees.controller.ts)  │
└──────┬──────────────────────┘
       │ 8. Extract DTO and user from request
       │    controller.create(createEmployeeDto, user)
       │
       ↓
┌─────────────────────────────┐
│  Service                    │
│  (employees.service.ts)     │
└──────┬──────────────────────┘
       │ 9. Business logic:
       │    • Validate email uniqueness
       │    • Check manager hierarchy
       │    • Generate default email if needed
       │
       ↓
┌─────────────────────────────┐
│  Repository (TypeORM)       │
└──────┬──────────────────────┘
       │ 10. INSERT INTO employees
       │
       ↓
┌─────────────────────────────┐
│  PostgreSQL Database        │
└──────┬──────────────────────┘
       │ 11. Return inserted record
       │
       ↓ (Response travels back up)
       │
┌─────────────────────────────┐
│  Service                    │
└──────┬──────────────────────┘
       │ 12. Create audit log
       │ 13. Fetch full employee with relations
       │
       ↓
┌─────────────────────────────┐
│  Controller                 │
└──────┬────────────────���─────┘
       │ 14. Return HTTP 201 Created
       │     Response: { id, firstName, ... }
       │
       ↓
┌─────────────────────────────┐
│  React Query                │
└──────┬──────────────────────┘
       │ 15. Update cache
       │ 16. Invalidate 'employees' query
       │ 17. Trigger refetch
       │
       ↓
┌─────────────────────────────┐
│  React Component            │
└──────┬──────────────────────┘
       │ 18. Close modal
       │ 19. Show updated list
       │
       ↓
┌─────────────────────────────┐
│  Browser (Re-render)        │
└─────────────────────────────┘
```

---

## Design Patterns

### Backend Patterns

#### 1. **Dependency Injection (DI)**
NestJS's core pattern for loose coupling:
```typescript
@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
  ) {}
}
```

#### 2. **Repository Pattern**
TypeORM abstracts database access:
```typescript
this.employeesRepository.find({ where: { status: 'active' } });
```

#### 3. **DTO Pattern**
Separate data structures for API contracts:
- `CreateEmployeeDto`: For POST requests
- `UpdateEmployeeDto`: For PUT requests
- `Employee` entity: For database

#### 4. **Guard Pattern**
Reusable authorization logic:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
```

#### 5. **Decorator Pattern**
Metadata for cross-cutting concerns:
```typescript
@Roles(RoleName.ADMIN, RoleName.HR)
```

#### 6. **Strategy Pattern**
Multiple authentication strategies (Local, JWT):
```typescript
passport.use(new LocalStrategy(...));
passport.use(new JwtStrategy(...));
```

#### 7. **Module Pattern**
Feature encapsulation in modules:
```typescript
@Module({
  imports: [...],
  controllers: [...],
  providers: [...],
  exports: [...],
})
```

### Frontend Patterns

#### 1. **Component Composition**
Building complex UIs from simple components:
```typescript
<Layout>
  <Header />
  <Sidebar />
  <Content>
    <EmployeeList />
  </Content>
</Layout>
```

#### 2. **Higher-Order Components (HOC)**
Component wrapping for shared logic:
```typescript
const PrivateRoute = ({ children }) => {
  return user ? children : <Navigate to="/login" />;
};
```

#### 3. **Custom Hooks**
Reusable stateful logic:
```typescript
const { user, login, logout } = useAuth();
```

#### 4. **Service Layer Pattern**
Centralized API communication:
```typescript
employeeService.getAll(filters);
```

#### 5. **Provider Pattern**
Context for global state:
```typescript
<AuthProvider>
  <App />
</AuthProvider>
```

#### 6. **Observer Pattern**
React Query for data synchronization:
```typescript
useQuery(['employees'], fetchEmployees);
// Automatically updates all components using this query
```

---

## Directory Structure

### Complete Project Layout

```
HRIS/
│
├── backend/                           # NestJS Backend
│   ├── src/
│   │   ├── main.ts                    # Entry point
│   │   ├── app.module.ts              # Root module
│   │   │
│   │   ├── entities/                  # TypeORM entities
│   │   │   ├── user.entity.ts
│   │   │   ├── role.entity.ts
│   │   │   ├── employee.entity.ts
│   │   │   ├── team.entity.ts
│   │   │   └── audit-log.entity.ts
│   │   │
│   │   ├── modules/                   # Feature modules
│   │   │   ├── auth/
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.service.spec.ts
│   │   │   │   ├── strategies/
│   │   │   │   │   ├── local.strategy.ts
│   │   │   │   │   └── jwt.strategy.ts
│   │   │   │   └── dto/
│   │   │   │       ├── login.dto.ts
│   │   │   │       └── register.dto.ts
│   │   │   │
│   │   │   ├── employees/
│   │   │   │   ├── employees.module.ts
│   │   │   │   ├── employees.controller.ts
│   │   │   │   ├── employees.service.ts
│   │   │   │   ├── employees.service.spec.ts
│   │   │   │   └── dto/
│   │   │   │
│   │   │   ├── teams/
│   │   │   ├── users/
│   │   │   ├── audit-log/
│   │   │   └── import-export/
│   │   │
│   │   ├── guards/                    # Authorization guards
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   │
│   │   ├── decorators/                # Custom decorators
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   │
│   │   └── seed.ts                    # Database seeding
│   │
│   ├── test/                          # E2E tests
│   │   ├── app.e2e-spec.ts
│   │   └── jest-e2e.json
│   │
│   ├── dist/                          # Compiled output
│   ├── node_modules/
│   ├── .env                           # Environment variables
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── jest.config.js
│
├── frontend/                          # React Frontend
│   ├── src/
│   │   ├── main.tsx                   # Entry point
│   │   ├── App.tsx                    # Root component
│   │   │
│   │   ├── components/                # Reusable components
│   │   │   ├── Layout.tsx
│   │   │   └── Layout.test.tsx
│   │   │
│   │   ├── pages/                     # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Login.test.tsx
│   │   │   ├── Employees.tsx
│   │   │   ├── Teams.tsx
│   │   │   ├── Search.tsx
│   │   │   ├── OrgChart.tsx
│   │   │   ├── ImportExport.tsx
│   │   │   └── AuditLogs.tsx
│   │   │
│   │   ├── context/                   # React Context
│   │   │   └── AuthContext.tsx
│   │   │
│   │   ├── services/                  # API services
│   │   │   ├── api.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── employee.service.ts
│   │   │   ├── team.service.ts
│   │   │   ├── audit-log.service.ts
│   │   │   └── import-export.service.ts
│   │   │
│   │   ├── types/                     # TypeScript types
│   │   │   └── index.ts
│   │   │
│   │   ├── assets/                    # Static assets
│   │   │
│   │   ├── test/                      # Test setup
│   │   │   └── setup.ts
│   │   │
│   │   └── index.css                  # Global styles
│   │
│   ├── public/                        # Static files
│   ├── dist/                          # Build output
│   ├── node_modules/
│   ├── .env                           # Environment variables
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vitest.config.ts
│
├─��� .git/                              # Git repository
├── .gitignore
├── README.md                          # Main documentation
├── SETUP.md                           # Setup instructions
├── DATABASE_SCHEMA.md                 # Database documentation
├── TODOs.md                           # Improvements list
├── DEPLOYMENT_GUIDE.md                # Deployment instructions
└── ARCHITECTURE.md                    # This file
```

---

## Dependencies

### Backend Dependencies (package.json)

#### Production Dependencies
```json
{
  "@nestjs/common": "^11.1.8",           // Core NestJS framework
  "@nestjs/config": "^4.0.2",            // Configuration management
  "@nestjs/core": "^11.1.8",             // Core NestJS framework
  "@nestjs/jwt": "^11.0.1",              // JWT token handling
  "@nestjs/passport": "^11.0.5",         // Authentication middleware
  "@nestjs/platform-express": "^11.1.8", // Express adapter
  "@nestjs/typeorm": "^11.0.0",          // TypeORM integration
  "bcrypt": "^6.0.0",                    // Password hashing
  "class-transformer": "^0.5.1",         // Object transformation
  "class-validator": "^0.14.2",          // DTO validation
  "csv-parser": "^3.2.0",                // CSV parsing
  "csv-writer": "^1.6.0",                // CSV generation
  "dotenv": "^17.2.3",                   // Environment variables
  "exceljs": "^4.4.0",                   // Excel file generation
  "jsonwebtoken": "^9.0.2",              // JWT library
  "multer": "^2.0.2",                    // File upload handling
  "passport": "^0.7.0",                  // Authentication strategies
  "passport-jwt": "^4.0.1",              // JWT strategy
  "passport-local": "^1.0.0",            // Local strategy
  "pdfkit": "^0.17.2",                   // PDF generation
  "pg": "^8.16.3",                       // PostgreSQL driver
  "typeorm": "^0.3.27"                   // ORM framework
}
```

#### Development Dependencies
```json
{
  "@nestjs/cli": "^11.0.10",             // NestJS CLI
  "@nestjs/testing": "^11.1.8",          // Testing utilities
  "@types/*": "...",                     // TypeScript type definitions
  "jest": "^30.2.0",                     // Testing framework
  "ts-jest": "^29.4.5",                  // Jest TypeScript support
  "ts-node": "^10.9.2",                  // TypeScript execution
  "typescript": "^5.9.3"                 // TypeScript compiler
}
```

### Frontend Dependencies (package.json)

#### Production Dependencies
```json
{
  "@headlessui/react": "^2.2.9",         // Unstyled UI components
  "@tailwindcss/postcss": "^4.1.16",     // TailwindCSS PostCSS plugin
  "@tanstack/react-query": "^5.90.5",    // Server state management
  "axios": "^1.13.1",                    // HTTP client
  "clsx": "^2.1.1",                      // Class name utility
  "react": "^19.1.1",                    // React library
  "react-dom": "^19.1.1",                // React DOM rendering
  "react-icons": "^5.5.0",               // Icon library
  "react-router-dom": "^7.9.5",          // Client-side routing
  "tailwindcss": "^4.1.16"               // Utility-first CSS
}
```

#### Development Dependencies
```json
{
  "@vitejs/plugin-react": "^5.0.4",      // Vite React plugin
  "@vitest/ui": "^4.0.5",                // Vitest UI
  "eslint": "^9.36.0",                   // Linting
  "typescript": "~5.9.3",                // TypeScript
  "vite": "^7.1.7",                      // Build tool
  "vitest": "^4.0.5"                     // Testing framework
}
```

---

## Summary

The HRIS application demonstrates a **modern, scalable, and maintainable architecture** following industry best practices:

### Key Architectural Strengths

✅ **Clear Separation of Concerns**: Frontend, backend, and database are decoupled
✅ **Type Safety**: TypeScript throughout entire stack
✅ **Modular Design**: Features encapsulated in self-contained modules
✅ **Security-First**: Multi-layered security with RBAC
✅ **Scalable**: Can grow from small to enterprise-scale
✅ **Testable**: Unit, integration, and E2E test support
✅ **Developer Experience**: Fast builds, hot reload, type checking
✅ **Production Ready**: Error handling, validation, audit logging

### Technology Choices Rationale

| Choice | Rationale |
|--------|-----------|
| **NestJS** | Enterprise-grade Node.js framework, excellent for large teams |
| **React** | Industry standard, massive ecosystem, flexible |
| **TypeScript** | Type safety reduces bugs, better IDE support |
| **TypeORM** | Type-safe database access, migrations support |
| **PostgreSQL** | Robust relational database, ACID compliance |
| **JWT** | Stateless authentication, scalable |
| **React Query** | Best-in-class server state management |
| **TailwindCSS** | Rapid UI development, consistent design |
| **Vite** | Fast builds and hot reload |

### Future Architectural Considerations

As the application grows, consider:

1. **Microservices**: Split into smaller services if needed
2. **Caching Layer**: Redis for performance
3. **Message Queue**: Bull/RabbitMQ for async tasks
4. **API Gateway**: Kong/nginx for routing and rate limiting
5. **GraphQL**: Alternative to REST for complex queries
6. **WebSockets**: Real-time features
7. **CDN**: Static asset delivery
8. **Monitoring**: APM tools for production insights

---

**Document Version:** 1.0
**Last Updated:** 2025-11-03
**Maintained By:** Development Team
