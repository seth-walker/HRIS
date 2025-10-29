import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Employee } from '../../entities/employee.entity';
import { AuditLog, AuditAction } from '../../entities/audit-log.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { RoleName } from '../../entities/role.entity';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  private async createAuditLog(
    userId: string,
    action: AuditAction,
    entityId: string,
    changes?: any,
  ) {
    const auditLog = this.auditLogRepository.create({
      userId,
      action,
      entityType: 'Employee',
      entityId,
      changes,
    });
    await this.auditLogRepository.save(auditLog);
  }

  async findAll(
    user: any,
    filters?: {
      department?: string;
      status?: string;
      title?: string;
      search?: string;
      teamId?: string;
      managerId?: string;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    },
  ): Promise<Employee[]> {
    const where: any = {};

    if (filters?.department) {
      where.department = filters.department;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.title) {
      where.title = Like(`%${filters.title}%`);
    }

    if (filters?.teamId) {
      where.teamId = filters.teamId;
    }

    if (filters?.managerId) {
      where.managerId = filters.managerId;
    }

    // Determine sort order
    const orderBy = filters?.sortBy || 'lastName';
    const orderDirection = filters?.sortOrder || 'ASC';
    const order: any = {};
    order[orderBy] = orderDirection;

    const employees = await this.employeesRepository.find({
      where,
      relations: ['manager', 'team', 'directReports'],
      order,
    });

    // Filter based on role permissions
    if (user.role.name === RoleName.MANAGER) {
      // Managers can only see their direct reports and themselves
      const managerId = user.employee?.id;
      return employees.filter(
        (emp) => emp.id === managerId || emp.managerId === managerId,
      );
    }

    // For search, filter by name
    if (filters?.search) {
      return employees.filter(
        (emp) =>
          emp.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
          emp.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
          emp.email?.toLowerCase().includes(filters.search.toLowerCase()),
      );
    }

    return employees;
  }

  async findOne(id: string, user: any): Promise<Employee> {
    const employee = await this.employeesRepository.findOne({
      where: { id },
      relations: ['manager', 'team', 'directReports', 'teamsLed'],
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Check permissions
    if (user.role.name === RoleName.MANAGER) {
      const managerId = user.employee?.id;
      if (employee.id !== managerId && employee.managerId !== managerId) {
        throw new ForbiddenException('Access denied');
      }
    }

    // Hide salary for non-admin/HR users
    if (
      user.role.name !== RoleName.ADMIN &&
      user.role.name !== RoleName.HR &&
      user.employee?.id !== employee.id
    ) {
      delete employee.salary;
    }

    return employee;
  }

  async create(
    createEmployeeDto: CreateEmployeeDto,
    userId: string,
  ): Promise<Employee> {
    const employee = this.employeesRepository.create(createEmployeeDto);
    const savedEmployee = await this.employeesRepository.save(employee);

    await this.createAuditLog(userId, AuditAction.CREATE, savedEmployee.id, {
      data: createEmployeeDto,
    });

    return this.findOne(savedEmployee.id, { role: { name: RoleName.ADMIN } });
  }

  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
    user: any,
  ): Promise<Employee> {
    const employee = await this.findOne(id, user);

    // Managers can only update their direct reports
    if (user.role.name === RoleName.MANAGER) {
      const managerId = user.employee?.id;
      if (employee.managerId !== managerId) {
        throw new ForbiddenException('Access denied');
      }
      // Managers cannot change salary
      delete updateEmployeeDto.salary;
    }

    const oldData = { ...employee };
    Object.assign(employee, updateEmployeeDto);
    const updatedEmployee = await this.employeesRepository.save(employee);

    await this.createAuditLog(user.id, AuditAction.UPDATE, id, {
      old: oldData,
      new: updateEmployeeDto,
    });

    return this.findOne(updatedEmployee.id, user);
  }

  async remove(id: string, userId: string): Promise<void> {
    const employee = await this.employeesRepository.findOne({ where: { id } });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    await this.createAuditLog(userId, AuditAction.DELETE, id, {
      deletedEmployee: employee,
    });

    await this.employeesRepository.remove(employee);
  }

  async getOrgChart(): Promise<any> {
    const employees = await this.employeesRepository.find({
      relations: ['manager', 'directReports', 'team'],
      order: { lastName: 'ASC' },
    });

    // Build tree structure starting from top-level employees (no manager)
    const buildTree = (managerId: string | null): any[] => {
      return employees
        .filter((emp) => emp.managerId === managerId)
        .map((emp) => ({
          id: emp.id,
          name: `${emp.firstName} ${emp.lastName}`,
          title: emp.title,
          department: emp.department,
          teamId: emp.teamId,
          children: buildTree(emp.id),
        }));
    };

    return buildTree(null);
  }

  async bulkImport(
    employeesData: CreateEmployeeDto[],
    userId: string,
  ): Promise<{ created: number; updated: number; errors: any[] }> {
    const results = {
      created: 0,
      updated: 0,
      errors: [],
    };

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
          results.updated++;
        } else {
          // Create new
          employee = this.employeesRepository.create(employeeData);
          await this.employeesRepository.save(employee);
          results.created++;
        }
      } catch (error) {
        results.errors.push({
          employee: employeeData,
          error: error.message,
        });
      }
    }

    await this.createAuditLog(userId, AuditAction.IMPORT, null, {
      summary: results,
    });

    return results;
  }

  async getDirectReports(managerId: string): Promise<Employee[]> {
    return this.employeesRepository.find({
      where: { managerId },
      relations: ['team'],
      order: { lastName: 'ASC' },
    });
  }
}
