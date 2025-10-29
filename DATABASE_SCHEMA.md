# HRIS Database Schema

## Entity Relationship Diagram

```
┌─────────────────┐
│     Roles       │
├─────────────────┤
│ id (PK)         │
│ name (enum)     │
│ description     │
│ createdAt       │
│ updatedAt       │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐          ┌─────────────────┐
│     Users       │          │   Employees     │
├─────────────────┤          ├─────────────────┤
│ id (PK)         │◄─────────┤ id (PK)         │
│ email           │   1:1    │ firstName       │
│ passwordHash    │          │ lastName        │
│ roleId (FK)     │          │ title           │
│ isActive        │          │ department      │
│ createdAt       │          │ email           │
│ updatedAt       │          │ phone           │
└─────────────────┘          │ managerId (FK)  │◄─┐
                             │ teamId (FK)     │  │
                             │ hireDate        │  │
                             │ salary          │  │
                             │ status          │  │
                             │ userId (FK)     │  │
                             │ createdAt       │  │
                             │ updatedAt       │  │
                             └────────┬────────┘  │
                                      │           │
                                      │           │
                                   N:1│           │Self-referencing
                                      │           │(Manager-Employee)
                             ┌────────▼────────┐  │
                             │     Teams       │  │
                             ├─────────────────┤  │
                             │ id (PK)         │  │
                             │ name            │  │
                             │ description     │  │
                             │ leadId (FK)     ├──┘
                             │ parentTeamId(FK)│◄─┐
                             │ createdAt       │  │
                             │ updatedAt       │  │
                             └─────────────────┘  │
                                      │           │
                                      └───────────┘
                                   Self-referencing
                                   (Parent-Child Teams)

┌─────────────────┐
│   AuditLogs     │
├─────────────────┤
│ id (PK)         │
│ userId (FK)     │─────┐
│ action (enum)   │     │
│ entityType      │     │
│ entityId        │     │
│ changes (json)  │     │
│ ipAddress       │     │
│ createdAt       │     │
└─────────────────┘     │
                        │
                        │
                        └──► References Users
```

## Table Definitions

### Roles

Defines system roles for RBAC.

| Column      | Type      | Constraints        | Description                    |
|-------------|-----------|-------------------|--------------------------------|
| id          | UUID      | PRIMARY KEY       | Unique identifier              |
| name        | ENUM      | UNIQUE, NOT NULL  | admin, hr, manager, employee   |
| description | TEXT      |                   | Role description               |
| createdAt   | TIMESTAMP | NOT NULL          | Record creation time           |
| updatedAt   | TIMESTAMP | NOT NULL          | Last update time               |

**Enum Values:** `admin`, `hr`, `manager`, `employee`

---

### Users

Authentication and user account information.

| Column       | Type      | Constraints              | Description                    |
|--------------|-----------|-------------------------|--------------------------------|
| id           | UUID      | PRIMARY KEY             | Unique identifier              |
| email        | VARCHAR   | UNIQUE, NOT NULL        | User email/login               |
| passwordHash | VARCHAR   | NOT NULL                | Bcrypt hashed password         |
| roleId       | UUID      | FOREIGN KEY → Roles.id  | User's role                    |
| isActive     | BOOLEAN   | DEFAULT TRUE            | Account active status          |
| createdAt    | TIMESTAMP | NOT NULL                | Record creation time           |
| updatedAt    | TIMESTAMP | NOT NULL                | Last update time               |

**Relationships:**
- Many-to-One with Roles
- One-to-One with Employees (optional)

---

### Employees

Core employee information and organizational structure.

| Column      | Type         | Constraints                  | Description                    |
|-------------|--------------|----------------------------|--------------------------------|
| id          | UUID         | PRIMARY KEY                | Unique identifier              |
| firstName   | VARCHAR      | NOT NULL                   | Employee first name            |
| lastName    | VARCHAR      | NOT NULL                   | Employee last name             |
| title       | VARCHAR      | NOT NULL                   | Job title                      |
| department  | VARCHAR      |                            | Department name                |
| email       | VARCHAR      |                            | Work email                     |
| phone       | VARCHAR      |                            | Contact phone                  |
| managerId   | UUID         | FOREIGN KEY → Employees.id | Direct manager (self-ref)      |
| teamId      | UUID         | FOREIGN KEY → Teams.id     | Assigned team                  |
| hireDate    | DATE         | NOT NULL                   | Date of hire                   |
| salary      | DECIMAL(10,2)|                            | Annual salary                  |
| status      | ENUM         | DEFAULT 'active'           | Employment status              |
| userId      | UUID         | FOREIGN KEY → Users.id     | Linked user account            |
| createdAt   | TIMESTAMP    | NOT NULL                   | Record creation time           |
| updatedAt   | TIMESTAMP    | NOT NULL                   | Last update time               |

**Enum Values (status):** `active`, `on_leave`, `terminated`

**Relationships:**
- Self-referencing (Manager → Employees)
- One-to-Many: directReports
- Many-to-One with Teams
- One-to-One with Users (optional)
- One-to-Many: teamsLed

---

### Teams

Team/department structure with hierarchy support.

| Column       | Type      | Constraints                  | Description                    |
|--------------|-----------|----------------------------|--------------------------------|
| id           | UUID      | PRIMARY KEY                | Unique identifier              |
| name         | VARCHAR   | NOT NULL                   | Team name                      |
| description  | TEXT      |                            | Team description               |
| leadId       | UUID      | FOREIGN KEY → Employees.id | Team leader                    |
| parentTeamId | UUID      | FOREIGN KEY → Teams.id     | Parent team (self-ref)         |
| createdAt    | TIMESTAMP | NOT NULL                   | Record creation time           |
| updatedAt    | TIMESTAMP | NOT NULL                   | Last update time               |

**Relationships:**
- Self-referencing (Parent → Child Teams)
- Many-to-One with Employees (lead)
- One-to-Many with Employees (members)

---

### AuditLogs

Comprehensive change tracking for compliance.

| Column     | Type      | Constraints              | Description                    |
|------------|-----------|-------------------------|--------------------------------|
| id         | UUID      | PRIMARY KEY             | Unique identifier              |
| userId     | UUID      | FOREIGN KEY → Users.id  | User who made the change       |
| action     | ENUM      | NOT NULL                | Type of action                 |
| entityType | VARCHAR   | NOT NULL                | Entity affected (e.g., Employee)|
| entityId   | UUID      |                         | ID of affected entity          |
| changes    | JSONB     |                         | Change details                 |
| ipAddress  | VARCHAR   |                         | IP address of request          |
| createdAt  | TIMESTAMP | NOT NULL                | Action timestamp               |

**Enum Values (action):** `create`, `update`, `delete`, `import`, `export`, `login`, `logout`

**Relationships:**
- Many-to-One with Users

---

## Key Relationships

### 1. Organizational Hierarchy (Employees)

Self-referencing relationship for manager-employee reporting structure:
```
CEO (managerId = null)
 ├── CTO (managerId = CEO.id)
 │   ├── Engineering Manager (managerId = CTO.id)
 │   │   ├── Senior Engineer (managerId = Manager.id)
 │   │   └── Junior Engineer (managerId = Manager.id)
```

### 2. Team Hierarchy

Self-referencing relationship for parent-child teams:
```
Engineering (parentTeamId = null)
 ├── Frontend Team (parentTeamId = Engineering.id)
 └── Backend Team (parentTeamId = Engineering.id)
```

### 3. User-Employee Link

One-to-one relationship allowing employees to have system access:
- Not all employees need user accounts
- Users with accounts can log in and access the system
- Permissions determined by User.roleId

## Indexes

Recommended indexes for performance:

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(roleId);

-- Employees
CREATE INDEX idx_employees_manager_id ON employees(managerId);
CREATE INDEX idx_employees_team_id ON employees(teamId);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_name ON employees(lastName, firstName);

-- Teams
CREATE INDEX idx_teams_parent_team_id ON teams(parentTeamId);
CREATE INDEX idx_teams_lead_id ON teams(leadId);

-- Audit Logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(userId);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entityType, entityId);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(createdAt DESC);
```

## Constraints

### Foreign Key Constraints

All foreign keys use `ON DELETE SET NULL` or `ON DELETE CASCADE` depending on the relationship:

- **Users.roleId** → Roles.id (RESTRICT - cannot delete role in use)
- **Employees.managerId** → Employees.id (SET NULL - preserve employee if manager deleted)
- **Employees.teamId** → Teams.id (SET NULL - preserve employee if team deleted)
- **Employees.userId** → Users.id (SET NULL - preserve employee if user deleted)
- **Teams.leadId** → Employees.id (SET NULL - preserve team if lead leaves)
- **Teams.parentTeamId** → Teams.id (SET NULL - preserve team if parent deleted)
- **AuditLogs.userId** → Users.id (SET NULL - preserve log if user deleted)

### Unique Constraints

- Users.email - Prevents duplicate accounts
- Roles.name - Ensures unique role names

## Sample Queries

### Get all employees in a department with their managers
```sql
SELECT
  e.*,
  m.firstName as managerFirstName,
  m.lastName as managerLastName
FROM employees e
LEFT JOIN employees m ON e.managerId = m.id
WHERE e.department = 'Engineering'
ORDER BY e.lastName;
```

### Get team hierarchy
```sql
WITH RECURSIVE team_hierarchy AS (
  SELECT id, name, parentTeamId, 0 as level
  FROM teams
  WHERE parentTeamId IS NULL

  UNION ALL

  SELECT t.id, t.name, t.parentTeamId, th.level + 1
  FROM teams t
  JOIN team_hierarchy th ON t.parentTeamId = th.id
)
SELECT * FROM team_hierarchy ORDER BY level, name;
```

### Get employee count by status
```sql
SELECT status, COUNT(*) as count
FROM employees
GROUP BY status;
```

### Get recent audit logs for an employee
```sql
SELECT
  al.*,
  u.email as performedBy
FROM audit_logs al
LEFT JOIN users u ON al.userId = u.id
WHERE al.entityType = 'Employee'
  AND al.entityId = '<employee-id>'
ORDER BY al.createdAt DESC
LIMIT 10;
```

## Data Integrity Rules

1. **Circular Manager References**: Application-level validation prevents employees from being their own managers or creating circular references

2. **Role Assignment**: Admin role should be carefully controlled and require special permissions to assign

3. **Salary Visibility**: Salary field should only be visible to Admin and HR roles, enforced at the API level

4. **Soft Deletes**: Consider implementing soft deletes (isDeleted flag) instead of hard deletes for important records

5. **Audit Trail**: All significant changes should create audit log entries
