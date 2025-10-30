# HRIS Features Documentation

## Overview

The HRIS system provides comprehensive employee and team management capabilities with role-based access control, data import/export, and advanced reporting features.

## Core Features

### 1. Employee Management

Complete employee lifecycle management with full CRUD operations.

#### Key Capabilities:
- **Create/Edit/Delete** employees with all standard HR fields
- **Manager Assignment** - Assign reporting relationships
- **Team Assignment** - Assign employees to teams
- **Status Management** - Track active, on leave, or terminated status
- **Search & Filter** - Quick search across all employee fields
- **Role-Based Access** - Different permissions per role

#### API Endpoints:
```http
GET    /api/employees              # List all with filters
GET    /api/employees/:id          # Get one employee
POST   /api/employees              # Create new
PUT    /api/employees/:id          # Update existing
DELETE /api/employees/:id          # Delete employee
GET    /api/employees/org-chart    # Get hierarchy
```

#### UI Features:
- Employee cards with key information
- Modal-based add/edit forms
- Manager dropdown selection
- Team assignment
- Delete confirmation dialogs

### 2. Team Management

Hierarchical team structure with team leads and member management.

#### Key Capabilities:
- **Create/Edit/Delete** teams
- **Team Hierarchy** - Parent-child team relationships
- **Team Lead Assignment** - Designate team leaders
- **Member Management** - Add/remove team members
- **Team Overview** - View all members and subteams

#### API Endpoints:
```http
GET    /api/teams            # List all teams
GET    /api/teams/:id        # Get one team
POST   /api/teams            # Create new
PUT    /api/teams/:id        # Update existing
DELETE /api/teams/:id        # Delete team
GET    /api/teams/hierarchy  # Get full hierarchy
```

#### UI Features:
- Team cards with member counts
- Manage Members modal
- Assign/unassign employees
- Team lead selection
- Subteam relationships

### 3. CSV Import

Bulk import employee data from CSV files with validation.

#### Key Capabilities:
- **CSV Template Download** - Get properly formatted template
- **File Upload** - Upload CSV files up to 5MB
- **Validation** - Automatic field validation
- **Duplicate Handling** - Updates existing employees by email
- **Error Reporting** - Detailed errors for failed rows
- **Success Metrics** - Shows imported/updated/failed counts

#### CSV Format:
```csv
firstName,lastName,title,department,email,phone,hireDate,salary,status
John,Doe,Engineer,IT,john@company.com,555-0100,2024-01-15,100000,active
```

#### API Endpoints:
```http
POST /api/import-export/import/csv       # Upload file
POST /api/import-export/import/csv-text  # Import from text
GET  /api/import-export/template/csv     # Download template
```

### 4. Excel Export

Export employee and team data to professionally formatted Excel files.

#### Employee Export:
- Blue headers with white text
- Currency formatting for salaries
- All employee details including manager and team
- Filtered by department/status
- Sortable columns

#### Team Export:
- Team hierarchy information
- Member counts per team
- Team lead details
- Parent team relationships

#### API Endpoints:
```http
GET /api/import-export/export/employees/excel?department=Engineering&status=active
GET /api/import-export/export/teams/excel
```

### 5. PDF Export

Generate professional PDF reports for printing and sharing.

#### Employee List PDF:
- Landscape orientation
- Tabular format with all key fields
- Automatic pagination
- Filtered results supported
- Generation timestamp footer

#### Organizational Chart PDF:
- Visual hierarchy with indentation
- Employee boxes with details
- Department information
- Automatic page breaks
- Ready for printing

#### API Endpoints:
```http
GET /api/import-export/export/employees/pdf?department=Engineering
GET /api/import-export/export/org-chart/pdf
```

### 6. Advanced Filtering

Filter and sort employee data by multiple criteria.

#### Available Filters:
- **Department** - Filter by department name
- **Status** - active, on_leave, terminated
- **Title** - Job title search
- **Team** - Filter by team membership
- **Manager** - Filter by reporting manager
- **General Search** - Cross-field search

#### Sorting:
- Sort by any employee field
- Ascending or descending order
- Maintains filter state

#### API Example:
```http
GET /api/employees?department=Engineering&status=active&sortBy=hireDate&sortOrder=DESC
```

### 7. Organizational Chart

Interactive visualization of company hierarchy.

#### Key Capabilities:
- **Hierarchical View** - CEO down to individual contributors
- **Reporting Lines** - Clear manager-employee relationships
- **Department Grouping** - View by department
- **Direct Reports** - Expandable sections
- **Export to PDF** - Print-ready org charts

#### API Endpoints:
```http
GET /api/employees/org-chart
GET /api/employees/:id/direct-reports
```

### 8. Audit Logging

Comprehensive change tracking for compliance.

#### Tracked Actions:
- Employee CREATE, UPDATE, DELETE
- Team CREATE, UPDATE, DELETE
- User role changes
- Bulk imports
- All changes with before/after data

#### Log Details:
- User who made the change
- Timestamp
- Action type
- Entity affected
- Old and new values
- IP address (future)

#### API Endpoints:
```http
GET /api/audit-logs?entityType=Employee&action=update
GET /api/audit-logs/entity?entityType=Employee&entityId=uuid
```

### 9. Global Search

System-wide search across all entities.

#### Search Capabilities:
- Search employees by name, email, title, department
- Search teams by name, description
- Real-time results
- Highlights matching terms
- Quick navigation to results

### 10. Authentication & Authorization

Secure JWT-based authentication with role-based access control.

#### Roles:
- **Admin** - Full system access
- **HR** - Employee and team management
- **Manager** - View/edit direct reports
- **Employee** - View-only access

#### Security Features:
- Password hashing with bcrypt
- JWT token authentication
- Token expiration
- Protected API endpoints
- Route guards on frontend

#### API Endpoints:
```http
POST /api/auth/login
POST /api/auth/register
```

## Role Permissions Matrix

| Feature | Admin | HR | Manager | Employee |
|---------|-------|-----|---------|----------|
| View All Employees | ✅ | ✅ | ❌* | ✅ |
| Create Employee | ✅ | ✅ | ❌ | ❌ |
| Edit Employee | ✅ | ✅ | ✅** | ❌ |
| Delete Employee | ✅ | ✅ | ❌ | ❌ |
| View Teams | ✅ | ✅ | ✅ | ✅ |
| Create/Edit Team | ✅ | ✅ | ❌ | ❌ |
| Delete Team | ✅ | ✅ | ❌ | ❌ |
| CSV Import | ✅ | ✅ | ❌ | ❌ |
| Excel Export | ✅ | ✅ | ❌ | ❌ |
| PDF Export | ✅ | ✅ | ✅*** | ✅*** |
| View Audit Logs | ✅ | ✅ | ❌ | ❌ |
| User Management | ✅ | ❌ | ❌ | ❌ |

*Managers can only view their direct reports
**Managers can only edit direct reports (excluding salary)
***Limited to accessible data

## Import/Export Features

### CSV Import

**Access:** Admin, HR only

**Steps:**
1. Download CSV template
2. Fill with employee data
3. Upload file (max 5MB)
4. View import results

**Features:**
- Validates required fields
- Updates existing employees by email
- Detailed error messages
- Transaction support (all or nothing)

### Excel Export

**Access:** Admin, HR only

**Formats:**
- Employee list with all details
- Team list with member counts
- Professional styling
- Filtered data export

### PDF Export

**Access:** All roles (within permissions)

**Formats:**
- Employee list (filtered)
- Organizational chart
- Landscape orientation
- Ready for printing

## Technical Implementation

### Backend Technologies
- **NestJS** - API framework
- **TypeORM** - Database ORM
- **PostgreSQL** - Database
- **ExcelJS** - Excel generation
- **PDFKit** - PDF generation
- **Multer** - File uploads
- **CSV Parser** - CSV processing

### Frontend Technologies
- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS v4** - Styling
- **React Query** - Data fetching
- **React Router** - Navigation
- **Axios** - HTTP client

### Security
- JWT tokens with bcrypt hashing
- Role-based guards
- CORS configuration
- Input validation
- SQL injection protection

## Usage Examples

### Import Employees
```typescript
// Upload CSV file
const file = document.querySelector('input[type="file"]').files[0];
const result = await importExportService.importCSVFile(file);
console.log(`Imported ${result.success} employees`);
```

### Export to Excel
```typescript
// Export filtered employees
await importExportService.exportEmployeesExcel({
  department: 'Engineering',
  status: 'active'
});
// File downloads automatically
```

### Create Employee
```typescript
// Create with manager assignment
const employee = await employeeService.create({
  firstName: 'John',
  lastName: 'Doe',
  title: 'Software Engineer',
  department: 'Engineering',
  email: 'john@company.com',
  managerId: 'manager-uuid',
  teamId: 'team-uuid',
  hireDate: '2024-01-15',
  salary: 100000,
  status: 'active'
});
```

### Assign Team Members
```typescript
// Add employee to team
await teamService.assignEmployee(employeeId, teamId);

// Remove from team
await teamService.unassignEmployee(employeeId);
```

## Troubleshooting

### Import Issues

**Problem:** CSV import fails
- **Solution:** Check CSV format matches template exactly
- Verify required fields present
- Check date format (YYYY-MM-DD)
- Ensure valid email addresses

### Export Issues

**Problem:** Export button doesn't work
- **Solution:** Verify proper role (Admin/HR)
- Check network connection
- Clear browser cache
- Try different browser

### Manager Assignment Issues

**Problem:** Manager not updating
- **Solution:** Clear the manager relation in form
- Ensure employee not self-assigned
- Check backend logs for errors
- Verify UUID format

## Future Enhancements

### Planned Features:
- [ ] Advanced filtering UI on employee page
- [ ] Saved filter presets
- [ ] Scheduled exports
- [ ] Excel import support
- [ ] Bulk update via CSV
- [ ] Custom report builder
- [ ] Email notifications
- [ ] Performance review module
- [ ] Time-off management
- [ ] Document storage

## API Reference

Complete API documentation with all endpoints, request/response formats, and authentication requirements.

### Base URL
```
http://localhost:3000/api
```

### Authentication
All endpoints except `/auth/login` require:
```
Authorization: Bearer <jwt-token>
```

### Response Format
```json
{
  "data": { ... },
  "message": "Success",
  "statusCode": 200
}
```

### Error Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## Support

For detailed documentation on specific topics, see:
- [SETUP.md](./SETUP.md) - Setup instructions
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [TESTING.md](./TESTING.md) - Testing guide
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Command reference
