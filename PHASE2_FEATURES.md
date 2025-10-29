# Phase 2 Features - Import/Export & Advanced Filtering

## Overview

Phase 2 adds comprehensive data import/export capabilities and advanced filtering to the HRIS system. These features enable HR administrators to efficiently manage large datasets and generate professional reports.

## New Features

### 1. CSV Import

Import employee data from CSV files with automatic validation and error reporting.

#### Features:
- **CSV Template Download** - Get a properly formatted template file
- **File Upload** - Upload CSV files directly through the UI
- **Validation** - Automatic validation of required fields
- **Duplicate Handling** - Updates existing employees based on email
- **Error Reporting** - Detailed error messages for failed imports
- **Audit Logging** - All imports are logged for compliance

#### CSV Format:
```csv
firstName,lastName,title,department,email,phone,hireDate,salary,status
John,Doe,Software Engineer,Engineering,john.doe@company.com,555-0100,2024-01-15,100000,active
```

#### API Endpoint:
```http
POST /api/import-export/import/csv
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <CSV file>
```

### 2. Excel Export

Export employee and team data to Excel format with professional formatting.

#### Employee Export Features:
- Professional styling with colored headers
- Formatted currency columns
- Includes manager and team information
- Filters by department and status
- Sortable columns

#### Team Export Features:
- Team hierarchy information
- Member counts
- Team lead details
- Parent team relationships

#### API Endpoints:
```http
GET /api/import-export/export/employees/excel?department=Engineering&status=active
Authorization: Bearer <token>

GET /api/import-export/export/teams/excel
Authorization: Bearer <token>
```

### 3. PDF Export

Generate professional PDF reports for printing and sharing.

#### Employee List PDF:
- Landscape orientation for better readability
- Tabular format with all key information
- Automatic pagination
- Filtered results
- Generation timestamp

#### Organizational Chart PDF:
- Visual hierarchy representation
- Indented levels showing reporting structure
- Employee details in boxes
- Automatic page breaks

#### API Endpoints:
```http
GET /api/import-export/export/employees/pdf?department=Engineering
Authorization: Bearer <token>

GET /api/import-export/export/org-chart/pdf
Authorization: Bearer <token>
```

### 4. Advanced Filtering

Enhanced filtering and sorting capabilities for the employee list.

#### New Filter Options:
- **Department** - Filter by department
- **Status** - Filter by employment status (active, on_leave, terminated)
- **Title** - Search by job title (partial match)
- **Team** - Filter by team membership
- **Manager** - Filter by direct manager
- **General Search** - Search across multiple fields

#### Sorting Options:
- **Sort By** - Any employee field (firstName, lastName, title, hireDate, etc.)
- **Sort Order** - Ascending or descending

#### API Example:
```http
GET /api/employees?department=Engineering&status=active&sortBy=hireDate&sortOrder=DESC
Authorization: Bearer <token>
```

## Frontend Integration

### New Page: Import/Export

A dedicated page for all import/export operations.

**Location:** `/import-export`

**Access:** Admin and HR roles only

#### Features:
- Download CSV template
- Upload and import CSV files
- Export buttons for all formats
- Import result display with success/error counts
- Intuitive card-based layout

### Updated Employee List

The employee list page now supports:
- Advanced filtering UI (coming in Phase 2.1)
- Sort controls (coming in Phase 2.1)
- Filter persistence (coming in Phase 2.1)

## Technical Implementation

### Backend Dependencies

```json
{
  "csv-parser": "Parse CSV files",
  "csv-writer": "Generate CSV files",
  "exceljs": "Create Excel files",
  "pdfkit": "Generate PDF documents",
  "multer": "Handle file uploads"
}
```

### New Backend Module

**Location:** `backend/src/modules/import-export/`

**Files:**
- `import-export.service.ts` - Core import/export logic
- `import-export.controller.ts` - REST API endpoints
- `import-export.module.ts` - NestJS module definition

### Frontend Service

**Location:** `frontend/src/services/import-export.service.ts`

Provides convenient methods for:
- Uploading files
- Downloading exports
- Handling blob responses

## Usage Examples

### 1. Import Employees from CSV

```typescript
// Frontend
import { importExportService } from './services/import-export.service';

const handleImport = async (file: File) => {
  const result = await importExportService.importCSVFile(file);
  console.log(`Imported ${result.success} employees`);
  console.log(`Errors: ${result.errors.length}`);
};
```

### 2. Export Employees to Excel

```typescript
// Frontend
await importExportService.exportEmployeesExcel({
  department: 'Engineering',
  status: 'active'
});
// File downloads automatically
```

### 3. Generate Org Chart PDF

```typescript
// Frontend
await importExportService.exportOrgChartPDF();
// File downloads automatically
```

### 4. Advanced Filtering

```typescript
// Frontend
const { data: employees } = useQuery({
  queryKey: ['employees', filters],
  queryFn: () => employeeService.getAll({
    department: 'Engineering',
    status: 'active',
    sortBy: 'lastName',
    sortOrder: 'ASC'
  })
});
```

## Security & Permissions

### Role-Based Access

| Feature | Admin | HR | Manager | Employee |
|---------|-------|-----|---------|----------|
| CSV Import | ✅ | ✅ | ❌ | ❌ |
| Excel Export | ✅ | ✅ | ❌ | ❌ |
| PDF Export | ✅ | ✅ | ✅* | ✅* |
| Download Template | ✅ | ✅ | ❌ | ❌ |
| Advanced Filters | ✅ | ✅ | ✅** | ✅** |

*Limited to their accessible data
**Filters work within their permission scope

### File Size Limits

- **CSV Import:** 5MB maximum
- **Excel Export:** No limit (generated on server)
- **PDF Export:** No limit (generated on server)

### Audit Logging

All import/export operations are logged:
- User who performed the action
- Timestamp
- Operation type
- Number of records affected
- Error details (if any)

## Testing

### Test Import File

Use the template download feature to get a properly formatted CSV file, or create one manually:

```csv
firstName,lastName,title,department,email,phone,hireDate,salary,status
Test,User,QA Engineer,Quality Assurance,test.user@company.com,555-0199,2024-01-01,90000,active
```

### Test Exports

1. Log in as Admin or HR user
2. Navigate to `/import-export`
3. Click any export button
4. Verify the downloaded file contains correct data
5. Check file formatting and completeness

### Test Advanced Filters

1. Navigate to `/employees`
2. Apply multiple filters
3. Verify results are correctly filtered
4. Test sorting by different fields
5. Verify manager and team filters work

## Performance Considerations

### Large Datasets

- **CSV Import:** Processes rows sequentially with transaction support
- **Excel Export:** Streams data to reduce memory usage
- **PDF Export:** Paginated automatically for large datasets

### Optimization Tips

1. Filter exports before generating to reduce file size
2. Import large files in batches if possible
3. Schedule bulk imports during off-peak hours
4. Use Excel format for datasets > 1000 rows

## Troubleshooting

### Import Issues

**Problem:** Import fails with validation errors

**Solution:** Check CSV format matches template exactly, including:
- Column names (case-sensitive)
- Date format (YYYY-MM-DD)
- Required fields (firstName, lastName, title, hireDate)

**Problem:** Duplicate employee warnings

**Solution:** Employees are matched by email. Update existing records or use unique emails.

### Export Issues

**Problem:** Export button doesn't work

**Solution:**
- Check network connection
- Verify you have proper permissions
- Check browser console for errors
- Try a different browser

**Problem:** PDF export is truncated

**Solution:**
- This is normal for large datasets
- Use filters to reduce result set
- Consider Excel export for complete data

### Filter Issues

**Problem:** Filters not working correctly

**Solution:**
- Clear browser cache
- Check for JavaScript errors in console
- Verify API is returning filtered data
- Test filters individually

## Future Enhancements (Phase 2.1)

- [ ] UI for advanced filtering on employee page
- [ ] Saved filter presets
- [ ] Scheduled exports
- [ ] Excel import support
- [ ] Bulk update via CSV
- [ ] Export audit logs
- [ ] Custom report builder
- [ ] Email export results

## API Reference

### Import Endpoints

```
POST /api/import-export/import/csv
POST /api/import-export/import/csv-text
GET  /api/import-export/template/csv
```

### Export Endpoints

```
GET /api/import-export/export/employees/excel
GET /api/import-export/export/employees/pdf
GET /api/import-export/export/teams/excel
GET /api/import-export/export/org-chart/pdf
```

### Filter Parameters

```
GET /api/employees?
  department=string
  &status=string
  &title=string
  &search=string
  &teamId=uuid
  &managerId=uuid
  &sortBy=string
  &sortOrder=ASC|DESC
```

## Changelog

### v2.0.0 (Phase 2) - 2024-10-29

**Added:**
- CSV import with validation
- Excel export for employees and teams
- PDF export for employees and org charts
- CSV template download
- Advanced filtering (backend)
- Sorting capabilities
- Import/Export page UI
- Role-based access control for import/export
- Audit logging for all operations

**Changed:**
- Enhanced employee service with advanced filters
- Updated navigation to include Import/Export
- Improved error handling for file operations

**Technical:**
- Added exceljs, pdfkit, csv-parser, multer dependencies
- New import-export module in backend
- New import-export service in frontend
- Updated API documentation

## Support

For issues related to Phase 2 features:
1. Check this documentation first
2. Review error messages carefully
3. Check audit logs for detailed operation history
4. Open a GitHub issue with:
   - Feature affected
   - Steps to reproduce
   - Error messages
   - Expected vs actual behavior
