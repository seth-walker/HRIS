import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike, In } from 'typeorm';
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

  private async checkEmailUniqueness(email: string, excludeId?: string): Promise<void> {
    if (!email) {
      return; // Null emails are allowed
    }

    const existingEmployee = await this.employeesRepository.findOne({
      where: { email },
    });

    if (existingEmployee && existingEmployee.id !== excludeId) {
      throw new ConflictException(`Employee with email ${email} already exists`);
    }
  }

  private async validateManagerHierarchy(employeeId: string, managerId: string): Promise<void> {
    if (!managerId) {
      return; // No manager is valid (top-level employee)
    }

    // Check if employee is trying to be their own manager
    if (employeeId === managerId) {
      throw new BadRequestException('An employee cannot be their own manager');
    }

    // Traverse up the management chain to detect circular references
    let currentManagerId = managerId;
    let depth = 0;
    const maxDepth = 20; // Prevent infinite loops

    while (currentManagerId && depth < maxDepth) {
      // Check if we've encountered the employee in the chain
      if (currentManagerId === employeeId) {
        throw new BadRequestException('Circular manager reference detected. This would create an invalid management hierarchy.');
      }

      // Get the next manager in the chain
      const manager = await this.employeesRepository.findOne({
        where: { id: currentManagerId },
        select: ['id', 'managerId'],
      });

      if (!manager) {
        throw new NotFoundException(`Manager with ID ${currentManagerId} not found`);
      }

      currentManagerId = manager.managerId;
      depth++;
    }

    if (depth >= maxDepth) {
      throw new BadRequestException('Management hierarchy is too deep (maximum 20 levels)');
    }
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
    // Determine sort order
    const orderBy = filters?.sortBy || 'lastName';
    const orderDirection = filters?.sortOrder || 'ASC';
    const order: any = {};
    order[orderBy] = orderDirection;

    // Build query using QueryBuilder for more complex search
    const queryBuilder = this.employeesRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.manager', 'manager')
      .leftJoinAndSelect('employee.team', 'team')
      .leftJoinAndSelect('employee.directReports', 'directReports');

    // Apply filters
    if (filters?.department) {
      queryBuilder.andWhere('employee.department = :department', { department: filters.department });
    }

    if (filters?.status) {
      queryBuilder.andWhere('employee.status = :status', { status: filters.status });
    }

    if (filters?.title) {
      queryBuilder.andWhere('employee.title ILIKE :title', { title: `%${filters.title}%` });
    }

    if (filters?.teamId) {
      queryBuilder.andWhere('employee.teamId = :teamId', { teamId: filters.teamId });
    }

    if (filters?.managerId) {
      queryBuilder.andWhere('employee.managerId = :managerId', { managerId: filters.managerId });
    }

    // Case-insensitive search across multiple fields
    if (filters?.search) {
      queryBuilder.andWhere(
        '(employee.firstName ILIKE :search OR employee.lastName ILIKE :search OR employee.email ILIKE :search OR employee.title ILIKE :search OR employee.department ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Apply sorting
    queryBuilder.orderBy(`employee.${orderBy}`, orderDirection);

    const employees = await queryBuilder.getMany();

    // Filter based on role permissions
    if (user.role.name === RoleName.MANAGER) {
      // Managers can only see their direct reports and themselves
      const managerId = user.employee?.id;
      return employees.filter(
        (emp) => emp.id === managerId || emp.managerId === managerId,
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
    // Generate default email if not provided
    if (!createEmployeeDto.email) {
      const firstName = createEmployeeDto.firstName.toLowerCase().replace(/\s+/g, '');
      const lastName = createEmployeeDto.lastName.toLowerCase().replace(/\s+/g, '');
      createEmployeeDto.email = `${firstName}.${lastName}@company.com`;
    }

    // Validate email uniqueness
    await this.checkEmailUniqueness(createEmployeeDto.email);

    // Validate manager hierarchy if managerId is provided
    if (createEmployeeDto.managerId) {
      // For new employees, we'll use a temporary ID to check hierarchy
      // This is safe because we haven't created the employee yet
      const tempId = 'temp-new-employee';
      await this.validateManagerHierarchy(tempId, createEmployeeDto.managerId);
    }

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
    console.log('📝 Update DTO received:', JSON.stringify(updateEmployeeDto, null, 2));
    console.log('📝 Manager ID in DTO:', updateEmployeeDto.managerId);

    const employee = await this.findOne(id, user);
    console.log('📝 Current employee managerId:', employee.managerId);

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

    // Validate email uniqueness if email is being updated
    if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.email) {
      await this.checkEmailUniqueness(updateEmployeeDto.email, id);
    }

    // Validate manager hierarchy if managerId is being updated
    if ('managerId' in updateEmployeeDto && updateEmployeeDto.managerId !== employee.managerId) {
      await this.validateManagerHierarchy(id, updateEmployeeDto.managerId);
    }

    // If managerId is being updated, clear the manager relation to prevent TypeORM from using it
    if ('managerId' in updateEmployeeDto) {
      delete employee.manager;
    }

    // If teamId is being updated, clear the team relation to prevent TypeORM from using it
    if ('teamId' in updateEmployeeDto) {
      delete employee.team;
    }

    Object.assign(employee, updateEmployeeDto);
    console.log('📝 Employee after assign, managerId:', employee.managerId);

    const updatedEmployee = await this.employeesRepository.save(employee);
    console.log('📝 Saved employee managerId:', updatedEmployee.managerId);

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
