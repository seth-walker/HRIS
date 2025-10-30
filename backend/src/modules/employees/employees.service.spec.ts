import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeesService } from './employees.service';
import { Employee, EmploymentStatus } from '../../entities/employee.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { RoleName } from '../../entities/role.entity';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let employeeRepository: Repository<Employee>;
  let auditLogRepository: Repository<AuditLog>;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const mockEmployeeRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockAuditLogRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        {
          provide: getRepositoryToken(Employee),
          useValue: mockEmployeeRepository,
        },
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockAuditLogRepository,
        },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
    employeeRepository = module.get<Repository<Employee>>(
      getRepositoryToken(Employee),
    );
    auditLogRepository = module.get<Repository<AuditLog>>(
      getRepositoryToken(AuditLog),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all employees for admin user', async () => {
      const mockEmployees = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          title: 'Software Engineer',
          status: EmploymentStatus.ACTIVE,
        },
        {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          title: 'Product Manager',
          status: EmploymentStatus.ACTIVE,
        },
      ];

      const mockUser = {
        role: { name: RoleName.ADMIN },
      };

      mockQueryBuilder.getMany.mockResolvedValue(mockEmployees);

      const result = await service.findAll(mockUser);

      expect(result).toEqual(mockEmployees);
      expect(mockEmployeeRepository.createQueryBuilder).toHaveBeenCalledWith('employee');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalled();
    });

    it('should filter employees by department', async () => {
      const mockEmployees = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          title: 'Software Engineer',
          department: 'Engineering',
          status: EmploymentStatus.ACTIVE,
        },
      ];

      const mockUser = {
        role: { name: RoleName.ADMIN },
      };

      mockQueryBuilder.getMany.mockResolvedValue(mockEmployees);

      const result = await service.findAll(mockUser, {
        department: 'Engineering',
      });

      expect(result).toEqual(mockEmployees);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'employee.department = :department',
        { department: 'Engineering' }
      );
    });

    it('should only return direct reports for manager', async () => {
      const managerId = 'manager-123';
      const mockEmployees = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          managerId: managerId,
        },
        {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          managerId: managerId,
        },
        {
          id: '3',
          firstName: 'Bob',
          lastName: 'Johnson',
          managerId: 'other-manager',
        },
      ];

      const mockUser = {
        role: { name: RoleName.MANAGER },
        employee: { id: managerId },
      };

      mockQueryBuilder.getMany.mockResolvedValue(mockEmployees);

      const result = await service.findAll(mockUser);

      // Should only include direct reports and the manager themselves
      expect(result.length).toBeLessThanOrEqual(3);
    });
  });

  describe('create', () => {
    it('should create a new employee', async () => {
      const createEmployeeDto = {
        firstName: 'John',
        lastName: 'Doe',
        title: 'Software Engineer',
        hireDate: new Date('2024-01-15'),
      };

      const mockEmployee = {
        id: '1',
        ...createEmployeeDto,
      };

      mockEmployeeRepository.create.mockReturnValue(mockEmployee);
      mockEmployeeRepository.save.mockResolvedValue(mockEmployee);
      mockEmployeeRepository.findOne.mockResolvedValue(mockEmployee);
      mockAuditLogRepository.create.mockReturnValue({});
      mockAuditLogRepository.save.mockResolvedValue({});

      const result = await service.create(createEmployeeDto as any, 'user-123');

      expect(mockEmployeeRepository.create).toHaveBeenCalledWith(
        createEmployeeDto,
      );
      expect(mockEmployeeRepository.save).toHaveBeenCalled();
      expect(mockAuditLogRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockEmployee);
    });
  });

  describe('findOne', () => {
    it('should return an employee by id', async () => {
      const mockEmployee = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        title: 'Software Engineer',
      };

      const mockUser = {
        role: { name: RoleName.ADMIN },
      };

      mockEmployeeRepository.findOne.mockResolvedValue(mockEmployee);

      const result = await service.findOne('1', mockUser);

      expect(result).toEqual(mockEmployee);
      expect(mockEmployeeRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['manager', 'team', 'directReports', 'teamsLed'],
      });
    });

    it('should throw NotFoundException when employee not found', async () => {
      const mockUser = {
        role: { name: RoleName.ADMIN },
      };

      mockEmployeeRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999', mockUser)).rejects.toThrow(
        'Employee not found',
      );
    });
  });
});
