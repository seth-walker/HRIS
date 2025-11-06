import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Employee, EmploymentStatus } from '../../entities/employee.entity';
import { Team } from '../../entities/team.entity';
import { AuditLog, AuditAction } from '../../entities/audit-log.entity';
import { Readable } from 'stream';

@Injectable()
export class ImportExportService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  private async createAuditLog(userId: string, action: AuditAction, changes?: any) {
    const auditLog = this.auditLogRepository.create({
      userId,
      action,
      entityType: 'ImportExport',
      changes,
    });
    await this.auditLogRepository.save(auditLog);
  }

  async parseCSV(csvContent: string): Promise<Partial<Employee>[]> {
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const employees: Partial<Employee>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const employee: any = {};

      headers.forEach((header, index) => {
        const value = values[index];
        if (!value) return;

        switch (header.toLowerCase()) {
          case 'firstname':
          case 'first_name':
            employee.firstName = value;
            break;
          case 'lastname':
          case 'last_name':
            employee.lastName = value;
            break;
          case 'title':
            employee.title = value;
            break;
          case 'department':
            employee.department = value;
            break;
          case 'email':
            employee.email = value;
            break;
          case 'phone':
            employee.phone = value;
            break;
          case 'hiredate':
          case 'hire_date':
            employee.hireDate = new Date(value);
            break;
          case 'salary':
            employee.salary = parseFloat(value);
            break;
          case 'status':
            employee.status = value as EmploymentStatus;
            break;
        }
      });

      if (employee.firstName && employee.lastName && employee.title && employee.hireDate) {
        employees.push(employee);
      }
    }

    return employees;
  }

  async importEmployeesFromCSV(
    csvContent: string,
    userId: string,
  ): Promise<{ success: number; errors: any[] }> {
    const employeesData = await this.parseCSV(csvContent);
    const results = { success: 0, errors: [] };

    for (const employeeData of employeesData) {
      try {
        // Check if employee exists by email
        let employee = null;
        if (employeeData.email) {
          employee = await this.employeesRepository.findOne({
            where: { email: employeeData.email },
          });
        }

        if (employee) {
          // Update existing
          Object.assign(employee, employeeData);
          await this.employeesRepository.save(employee);
        } else {
          // Create new
          employee = this.employeesRepository.create(employeeData);
          await this.employeesRepository.save(employee);
        }
        results.success++;
      } catch (error) {
        results.errors.push({
          employee: employeeData,
          error: error.message,
        });
      }
    }

    await this.createAuditLog(userId, AuditAction.IMPORT, {
      type: 'CSV',
      summary: results,
    });

    return results;
  }

  async exportEmployeesToExcel(filters?: any): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Employees');

    // Define columns
    worksheet.columns = [
      { header: 'First Name', key: 'firstName', width: 15 },
      { header: 'Last Name', key: 'lastName', width: 15 },
      { header: 'Title', key: 'title', width: 25 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Manager', key: 'manager', width: 20 },
      { header: 'Team', key: 'team', width: 20 },
      { header: 'Hire Date', key: 'hireDate', width: 12 },
      { header: 'Salary', key: 'salary', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Build query with filters using QueryBuilder
    const queryBuilder = this.employeesRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.manager', 'manager')
      .leftJoinAndSelect('employee.teamMemberships', 'teamMemberships')
      .leftJoinAndSelect('teamMemberships.team', 'team');

    // Apply filters
    if (filters?.department) {
      queryBuilder.andWhere('employee.department = :department', { department: filters.department });
    }
    if (filters?.status) {
      queryBuilder.andWhere('employee.status = :status', { status: filters.status });
    }
    if (filters?.managerId) {
      queryBuilder.andWhere('employee.managerId = :managerId', { managerId: filters.managerId });
    }
    if (filters?.title) {
      queryBuilder.andWhere('employee.title ILIKE :title', { title: `%${filters.title}%` });
    }

    queryBuilder.orderBy('employee.lastName', 'ASC');

    const employees = await queryBuilder.getMany();

    // Add data rows
    employees.forEach((employee) => {
      worksheet.addRow({
        firstName: employee.firstName,
        lastName: employee.lastName,
        title: employee.title,
        department: employee.department || '',
        email: employee.email || '',
        phone: employee.phone || '',
        manager: employee.manager
          ? `${employee.manager.firstName} ${employee.manager.lastName}`
          : '',
        team: employee.teamMemberships && employee.teamMemberships.length > 0
          ? employee.teamMemberships.map((m: any) => m.team.name).join(', ')
          : '',
        hireDate: employee.hireDate,
        salary: employee.salary || '',
        status: employee.status,
      });
    });

    // Format currency column
    worksheet.getColumn('salary').numFmt = '$#,##0.00';

    // Add borders to all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
  }

  async exportTeamsToExcel(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Teams');

    // Define columns
    worksheet.columns = [
      { header: 'Team Name', key: 'name', width: 25 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Team Lead', key: 'lead', width: 25 },
      { header: 'Parent Team', key: 'parentTeam', width: 25 },
      { header: 'Member Count', key: 'memberCount', width: 15 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Get teams
    const teams = await this.teamsRepository.find({
      relations: ['lead', 'parentTeam', 'teamMemberships'],
      order: { name: 'ASC' },
    });

    // Add data rows
    teams.forEach((team) => {
      worksheet.addRow({
        name: team.name,
        description: team.description || '',
        lead: team.lead
          ? `${team.lead.firstName} ${team.lead.lastName}`
          : '',
        parentTeam: team.parentTeam?.name || '',
        memberCount: team.teamMemberships?.length || 0,
      });
    });

    // Add borders
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
  }

  async exportOrgChartToPDF(): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Title
      doc.fontSize(20).font('Helvetica-Bold').text('Organizational Chart', {
        align: 'center',
      });
      doc.moveDown();

      // Get employees
      const employees = await this.employeesRepository.find({
        relations: ['manager', 'directReports', 'team'],
        order: { lastName: 'ASC' },
      });

      // Build hierarchy
      const topLevelEmployees = employees.filter((emp) => !emp.managerId);

      const renderEmployee = (employee: Employee, level: number) => {
        const indent = level * 20;
        doc.fontSize(10).font('Helvetica');

        // Employee box
        const boxWidth = 400 - indent;
        const boxHeight = 60;
        const x = 50 + indent;
        let y = doc.y;

        // Check if we need a new page
        if (y + boxHeight > doc.page.height - 50) {
          doc.addPage();
          y = 50;
        }

        // Draw box
        doc.rect(x, y, boxWidth, boxHeight).stroke();

        // Employee info
        doc.font('Helvetica-Bold')
          .fontSize(12)
          .text(`${employee.firstName} ${employee.lastName}`, x + 10, y + 10, {
            width: boxWidth - 20,
          });

        doc.font('Helvetica')
          .fontSize(10)
          .text(employee.title, x + 10, y + 25, { width: boxWidth - 20 });

        if (employee.department) {
          doc.fontSize(9)
            .fillColor('gray')
            .text(employee.department, x + 10, y + 40, { width: boxWidth - 20 });
          doc.fillColor('black');
        }

        doc.y = y + boxHeight + 5;

        // Render direct reports
        const directReports = employees.filter(
          (emp) => emp.managerId === employee.id,
        );
        directReports.forEach((report) => {
          renderEmployee(report, level + 1);
        });
      };

      topLevelEmployees.forEach((employee) => {
        renderEmployee(employee, 0);
      });

      doc.end();
    });
  }

  async exportEmployeeListToPDF(filters?: any): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50, layout: 'landscape' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Title
      doc.fontSize(18).font('Helvetica-Bold').text('Employee Directory', {
        align: 'center',
      });
      doc.moveDown();

      // Build query with filters using QueryBuilder
      const queryBuilder = this.employeesRepository
        .createQueryBuilder('employee')
        .leftJoinAndSelect('employee.manager', 'manager')
        .leftJoinAndSelect('employee.teamMemberships', 'teamMemberships')
        .leftJoinAndSelect('teamMemberships.team', 'team');

      // Apply filters
      if (filters?.department) {
        queryBuilder.andWhere('employee.department = :department', { department: filters.department });
      }
      if (filters?.status) {
        queryBuilder.andWhere('employee.status = :status', { status: filters.status });
      }
      if (filters?.managerId) {
        queryBuilder.andWhere('employee.managerId = :managerId', { managerId: filters.managerId });
      }
      if (filters?.title) {
        queryBuilder.andWhere('employee.title ILIKE :title', { title: `%${filters.title}%` });
      }

      queryBuilder.orderBy('employee.lastName', 'ASC');

      const employees = await queryBuilder.getMany();

      // Table header
      const tableTop = doc.y;
      const colWidths = [120, 150, 100, 120, 100, 80];
      const headers = ['Name', 'Title', 'Department', 'Email', 'Team', 'Status'];

      doc.fontSize(10).font('Helvetica-Bold');
      let x = 50;
      headers.forEach((header, i) => {
        doc.text(header, x, tableTop, { width: colWidths[i] });
        x += colWidths[i];
      });

      // Table rows
      doc.font('Helvetica').fontSize(9);
      let y = tableTop + 20;

      employees.forEach((employee) => {
        // Check if we need a new page
        if (y > doc.page.height - 100) {
          doc.addPage();
          y = 50;
        }

        x = 50;
        const rowData = [
          `${employee.firstName} ${employee.lastName}`,
          employee.title,
          employee.department || '',
          employee.email || '',
          employee.teamMemberships && employee.teamMemberships.length > 0
            ? employee.teamMemberships.map((m: any) => m.team.name).join(', ')
            : '',
          employee.status,
        ];

        rowData.forEach((data, i) => {
          doc.text(data, x, y, { width: colWidths[i], height: 15 });
          x += colWidths[i];
        });

        y += 20;
      });

      // Footer
      doc.fontSize(8)
        .fillColor('gray')
        .text(
          `Generated on ${new Date().toLocaleDateString()}`,
          50,
          doc.page.height - 50,
          { align: 'center' },
        );

      doc.end();
    });
  }

  async generateCSVTemplate(): Promise<string> {
    const headers = [
      'firstName',
      'lastName',
      'title',
      'department',
      'email',
      'phone',
      'hireDate',
      'salary',
      'status',
    ];

    const exampleRow = [
      'John',
      'Doe',
      'Software Engineer',
      'Engineering',
      'john.doe@company.com',
      '555-0100',
      '2024-01-15',
      '100000',
      'active',
    ];

    return `${headers.join(',')}\n${exampleRow.join(',')}\n`;
  }
}
