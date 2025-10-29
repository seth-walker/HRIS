# Phase 2 Quick Start Guide

## Getting Started with Import/Export

### Prerequisites
- HRIS system running (Phase 1 complete)
- Admin or HR user account
- Sample employee data (optional)

## Quick Setup

### 1. Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. Access Import/Export Features

1. Log in as Admin or HR user:
   - **Admin:** admin@hris.com / admin123
   - **HR:** hr@hris.com / hr123

2. Click "Import/Export" in the navigation menu

## Common Tasks

### Task 1: Import Employees from CSV (2 minutes)

**Step 1:** Download the template
```
1. Click "Download CSV Template"
2. Save the file locally
```

**Step 2:** Edit the template
```
Open employee-template.csv in Excel/Text Editor
Add your employee data:
firstName,lastName,title,department,email,phone,hireDate,salary,status
Jane,Smith,Senior Developer,Engineering,jane@company.com,555-0101,2024-01-20,120000,active
Bob,Johnson,Product Manager,Product,bob@company.com,555-0102,2024-02-15,110000,active
```

**Step 3:** Upload and import
```
1. Click "Choose File" and select your CSV
2. Click "Import Employees"
3. View results (success count and errors)
```

### Task 2: Export Employee List to Excel (30 seconds)

```
1. Go to Import/Export page
2. Under "Export Data" > "Employee Data"
3. Click "Export to Excel"
4. File downloads automatically
5. Open in Excel to view
```

### Task 3: Generate Org Chart PDF (30 seconds)

```
1. Go to Import/Export page
2. Under "Export Data" > "Org Chart"
3. Click "Export Org Chart to PDF"
4. File downloads automatically
5. Open PDF to view hierarchy
```

### Task 4: Export Filtered Data (1 minute)

Currently filters must be applied via API. UI coming in Phase 2.1.

**Via API:**
```bash
# Get token first (from login)
TOKEN="your-jwt-token"

# Export only Engineering department
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/import-export/export/employees/excel?department=Engineering" \
  --output engineering-employees.xlsx

# Export only active employees
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/import-export/export/employees/pdf?status=active" \
  --output active-employees.pdf
```

## CSV Import Format

### Required Fields
- `firstName` - Employee first name
- `lastName` - Employee last name
- `title` - Job title
- `hireDate` - Date in YYYY-MM-DD format

### Optional Fields
- `department` - Department name
- `email` - Work email (used for matching existing employees)
- `phone` - Phone number
- `salary` - Annual salary (number)
- `status` - active, on_leave, or terminated

### Example CSV
```csv
firstName,lastName,title,department,email,phone,hireDate,salary,status
Alice,Brown,UX Designer,Design,alice@company.com,555-0103,2024-03-01,95000,active
Charlie,Davis,DevOps Engineer,Engineering,charlie@company.com,555-0104,2024-03-15,105000,active
Diana,Evans,HR Coordinator,Human Resources,diana@company.com,555-0105,2024-04-01,70000,active
```

## Tips & Tricks

### For Imports:
1. **Start Small** - Test with 2-3 rows first
2. **Check Dates** - Use YYYY-MM-DD format only
3. **Use Template** - Always start with the downloaded template
4. **Email Matching** - Employees with same email will be updated, not duplicated
5. **Review Errors** - Click "View errors" if import has issues

### For Exports:
1. **Excel for Analysis** - Use Excel format when you need to analyze or modify data
2. **PDF for Sharing** - Use PDF format for reports and presentations
3. **Filter First** - Apply filters before exporting to reduce file size
4. **Regular Backups** - Export full employee list weekly/monthly

### For Large Datasets:
1. **Break Into Batches** - Import 100-200 employees at a time
2. **Use Excel** - Excel handles large datasets better than PDF
3. **Schedule Exports** - Run during off-peak hours (coming in Phase 2.1)

## Troubleshooting

### Import Not Working

**Problem:** "No file uploaded" error
- **Solution:** Make sure to click "Choose File" and select a CSV file

**Problem:** Import shows all errors
- **Solution:** Check CSV format matches template exactly
- Verify column names (case-sensitive)
- Check date format (must be YYYY-MM-DD)
- Ensure required fields are present

**Problem:** Some employees imported, some failed
- **Solution:** This is normal! Check "View errors" for details
- Common issues: invalid date format, missing required fields
- Fix errors in CSV and re-import (existing employees will update)

### Export Not Working

**Problem:** Export button doesn't respond
- **Solution:** Check browser console (F12) for errors
- Try refreshing the page
- Verify you're logged in as Admin or HR

**Problem:** Downloaded file won't open
- **Solution:**
  - For Excel: Make sure you have Excel or compatible software
  - For PDF: Use Adobe Reader or browser PDF viewer
  - Try downloading again

**Problem:** Export is empty or incomplete
- **Solution:** Check if you have employees in the database
- Try exporting without filters first
- Verify permissions (some data may be restricted)

### Permission Issues

**Problem:** "Access Restricted" message
- **Solution:** Import/Export is only for Admin and HR roles
- Log in with admin@hris.com or hr@hris.com
- Contact admin to change your role

## API Reference

### Import
```bash
# Upload CSV file
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@employees.csv" \
  http://localhost:3000/api/import-export/import/csv

# Import from text
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"csvContent":"firstName,lastName,title,hireDate\nJohn,Doe,Engineer,2024-01-15"}' \
  http://localhost:3000/api/import-export/import/csv-text
```

### Export
```bash
# Export employees to Excel
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/import-export/export/employees/excel" \
  --output employees.xlsx

# Export teams to Excel
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/import-export/export/teams/excel" \
  --output teams.xlsx

# Export employees to PDF
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/import-export/export/employees/pdf" \
  --output employees.pdf

# Export org chart to PDF
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/import-export/export/org-chart/pdf" \
  --output org-chart.pdf

# Download CSV template
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/import-export/template/csv" \
  --output template.csv
```

### Advanced Filtering
```bash
# Filter employees by department
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/employees?department=Engineering"

# Filter by status and sort
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/employees?status=active&sortBy=hireDate&sortOrder=DESC"

# Multiple filters
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/employees?department=Engineering&status=active&sortBy=lastName"
```

## Next Steps

1. **Try the examples above** - Hands-on is the best way to learn
2. **Read the full documentation** - See [PHASE2_FEATURES.md](PHASE2_FEATURES.md)
3. **Explore the UI** - Click around and discover features
4. **Import your data** - Start moving your real employee data into the system
5. **Set up regular exports** - Create a backup schedule

## Need Help?

- 📖 **Full Documentation:** [PHASE2_FEATURES.md](PHASE2_FEATURES.md)
- 🔍 **Detailed Summary:** [PHASE2_SUMMARY.md](PHASE2_SUMMARY.md)
- 📚 **Main README:** [README.md](README.md)
- 🐛 **Issues:** Open a GitHub issue

## Quick Reference Card

```
┌─────────────────────────────────────────────────┐
│          Phase 2 Quick Reference                │
├─────────────────────────────────────────────────┤
│ Import CSV:                                     │
│   1. Download template                          │
│   2. Fill with data                             │
│   3. Upload file                                │
│                                                 │
│ Export Excel:                                   │
│   Click "Export to Excel" button               │
│                                                 │
│ Export PDF:                                     │
│   Click "Export to PDF" button                 │
│                                                 │
│ Access:                                         │
│   Admin & HR only                               │
│                                                 │
│ Files:                                          │
│   Max 5MB for uploads                           │
│   .csv for imports                              │
│   .xlsx and .pdf for exports                    │
└─────────────────────────────────────────────────┘
```

Happy importing and exporting! 🚀
