import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { Role, RoleName } from './entities/role.entity';
import { User } from './entities/user.entity';
import { Employee, EmploymentStatus } from './entities/employee.entity';
import { Team } from './entities/team.entity';
import { AuditLog } from './entities/audit-log.entity';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'hris_user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'hris_db',
  entities: [Role, User, Employee, Team, AuditLog],
  synchronize: true,
  logging: false,
});

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    const roleRepository = AppDataSource.getRepository(Role);
    const userRepository = AppDataSource.getRepository(User);
    const employeeRepository = AppDataSource.getRepository(Employee);
    const teamRepository = AppDataSource.getRepository(Team);

    // Clear existing data in correct order (child tables first)
    // Due to foreign key constraints, we need to clear in this specific order
    // Only clear if tables exist (first run won't have tables yet)
    const tablesToClear = ['employees', 'teams', 'users', 'roles', 'audit_logs'];
    for (const table of tablesToClear) {
      try {
        await AppDataSource.query(`TRUNCATE TABLE "${table}" CASCADE`);
      } catch (e) {
        // Table doesn't exist yet on first run, that's okay
        console.log(`Skipping ${table} (doesn't exist yet)`);
      }
    }

    // Create Roles
    const adminRole = roleRepository.create({
      name: RoleName.ADMIN,
      description: 'Full system access',
    });
    const hrRole = roleRepository.create({
      name: RoleName.HR,
      description: 'Can manage employees and teams',
    });
    const managerRole = roleRepository.create({
      name: RoleName.MANAGER,
      description: 'Can view and edit direct reports',
    });
    const employeeRole = roleRepository.create({
      name: RoleName.EMPLOYEE,
      description: 'Basic read-only access',
    });

    await roleRepository.save([adminRole, hrRole, managerRole, employeeRole]);
    console.log('✅ Roles created');

    // Create Admin User
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const adminUser = userRepository.create({
      email: 'admin@hris.com',
      passwordHash: adminPasswordHash,
      roleId: adminRole.id,
    });
    await userRepository.save(adminUser);
    console.log('✅ Admin user created (email: admin@hris.com, password: admin123)');

    // Create HR User
    const hrPasswordHash = await bcrypt.hash('hr123', 10);
    const hrUser = userRepository.create({
      email: 'hr@hris.com',
      passwordHash: hrPasswordHash,
      roleId: hrRole.id,
    });
    await userRepository.save(hrUser);
    console.log('✅ HR user created (email: hr@hris.com, password: hr123)');

    // Create Teams
    const engineeringTeam = teamRepository.create({
      name: 'Engineering',
      description: 'Product development and engineering',
    });
    const salesTeam = teamRepository.create({
      name: 'Sales',
      description: 'Sales and business development',
    });
    const hrTeam = teamRepository.create({
      name: 'Human Resources',
      description: 'HR and people operations',
    });

    await teamRepository.save([engineeringTeam, salesTeam, hrTeam]);
    console.log('✅ Teams created');

    // Create CEO (no manager)
    const ceo = employeeRepository.create({
      firstName: 'Sarah',
      lastName: 'Johnson',
      title: 'CEO',
      department: 'Executive',
      email: 'sarah.johnson@company.com',
      phone: '555-0001',
      hireDate: new Date('2020-01-15'),
      salary: 250000,
      status: EmploymentStatus.ACTIVE,
    });
    await employeeRepository.save(ceo);

    // Create CTO (reports to CEO)
    const cto = employeeRepository.create({
      firstName: 'Michael',
      lastName: 'Chen',
      title: 'CTO',
      department: 'Engineering',
      email: 'michael.chen@company.com',
      phone: '555-0002',
      managerId: ceo.id,
      teamId: engineeringTeam.id,
      hireDate: new Date('2020-03-01'),
      salary: 200000,
      status: EmploymentStatus.ACTIVE,
    });
    await employeeRepository.save(cto);

    // Update engineering team lead
    engineeringTeam.leadId = cto.id;
    await teamRepository.save(engineeringTeam);

    // Create Engineering Manager (reports to CTO)
    const engManager = employeeRepository.create({
      firstName: 'Emily',
      lastName: 'Rodriguez',
      title: 'Engineering Manager',
      department: 'Engineering',
      email: 'emily.rodriguez@company.com',
      phone: '555-0003',
      managerId: cto.id,
      teamId: engineeringTeam.id,
      hireDate: new Date('2021-05-15'),
      salary: 150000,
      status: EmploymentStatus.ACTIVE,
    });
    await employeeRepository.save(engManager);

    // Create Manager User
    const managerPasswordHash = await bcrypt.hash('manager123', 10);
    const managerUser = userRepository.create({
      email: 'emily.rodriguez@company.com',
      passwordHash: managerPasswordHash,
      roleId: managerRole.id,
      employee: engManager,
    });
    await userRepository.save(managerUser);
    console.log('✅ Manager user created (email: emily.rodriguez@company.com, password: manager123)');

    // Create Software Engineers (report to Engineering Manager)
    const engineer1 = employeeRepository.create({
      firstName: 'David',
      lastName: 'Kim',
      title: 'Senior Software Engineer',
      department: 'Engineering',
      email: 'david.kim@company.com',
      phone: '555-0004',
      managerId: engManager.id,
      teamId: engineeringTeam.id,
      hireDate: new Date('2021-08-01'),
      salary: 130000,
      status: EmploymentStatus.ACTIVE,
    });

    const engineer2 = employeeRepository.create({
      firstName: 'Lisa',
      lastName: 'Wang',
      title: 'Software Engineer',
      department: 'Engineering',
      email: 'lisa.wang@company.com',
      phone: '555-0005',
      managerId: engManager.id,
      teamId: engineeringTeam.id,
      hireDate: new Date('2022-01-10'),
      salary: 110000,
      status: EmploymentStatus.ACTIVE,
    });

    const engineer3 = employeeRepository.create({
      firstName: 'James',
      lastName: 'Taylor',
      title: 'Junior Software Engineer',
      department: 'Engineering',
      email: 'james.taylor@company.com',
      phone: '555-0006',
      managerId: engManager.id,
      teamId: engineeringTeam.id,
      hireDate: new Date('2023-06-01'),
      salary: 85000,
      status: EmploymentStatus.ACTIVE,
    });

    await employeeRepository.save([engineer1, engineer2, engineer3]);

    // Create Employee User (for one of the engineers)
    const employeePasswordHash = await bcrypt.hash('employee123', 10);
    const employeeUser = userRepository.create({
      email: 'david.kim@company.com',
      passwordHash: employeePasswordHash,
      roleId: employeeRole.id,
      employee: engineer1,
    });
    await userRepository.save(employeeUser);
    console.log('✅ Employee user created (email: david.kim@company.com, password: employee123)');

    // Create Sales VP (reports to CEO)
    const salesVP = employeeRepository.create({
      firstName: 'Robert',
      lastName: 'Martinez',
      title: 'VP of Sales',
      department: 'Sales',
      email: 'robert.martinez@company.com',
      phone: '555-0007',
      managerId: ceo.id,
      teamId: salesTeam.id,
      hireDate: new Date('2020-06-01'),
      salary: 180000,
      status: EmploymentStatus.ACTIVE,
    });
    await employeeRepository.save(salesVP);

    // Update sales team lead
    salesTeam.leadId = salesVP.id;
    await teamRepository.save(salesTeam);

    // Create Sales Representatives
    const salesRep1 = employeeRepository.create({
      firstName: 'Amanda',
      lastName: 'Brown',
      title: 'Senior Sales Representative',
      department: 'Sales',
      email: 'amanda.brown@company.com',
      phone: '555-0008',
      managerId: salesVP.id,
      teamId: salesTeam.id,
      hireDate: new Date('2021-03-15'),
      salary: 95000,
      status: EmploymentStatus.ACTIVE,
    });

    const salesRep2 = employeeRepository.create({
      firstName: 'Kevin',
      lastName: 'Davis',
      title: 'Sales Representative',
      department: 'Sales',
      email: 'kevin.davis@company.com',
      phone: '555-0009',
      managerId: salesVP.id,
      teamId: salesTeam.id,
      hireDate: new Date('2022-09-01'),
      salary: 75000,
      status: EmploymentStatus.ACTIVE,
    });

    await employeeRepository.save([salesRep1, salesRep2]);

    // Create HR Director (reports to CEO)
    const hrDirector = employeeRepository.create({
      firstName: 'Jessica',
      lastName: 'Wilson',
      title: 'HR Director',
      department: 'Human Resources',
      email: 'jessica.wilson@company.com',
      phone: '555-0010',
      managerId: ceo.id,
      teamId: hrTeam.id,
      hireDate: new Date('2020-04-01'),
      salary: 140000,
      status: EmploymentStatus.ACTIVE,
    });
    await employeeRepository.save(hrDirector);

    // Update HR team lead
    hrTeam.leadId = hrDirector.id;
    await teamRepository.save(hrTeam);

    // Link HR user to HR Director employee
    hrUser.employee = hrDirector;
    await userRepository.save(hrUser);

    // Create HR Coordinator
    const hrCoordinator = employeeRepository.create({
      firstName: 'Nicole',
      lastName: 'Anderson',
      title: 'HR Coordinator',
      department: 'Human Resources',
      email: 'nicole.anderson@company.com',
      phone: '555-0011',
      managerId: hrDirector.id,
      teamId: hrTeam.id,
      hireDate: new Date('2021-11-01'),
      salary: 65000,
      status: EmploymentStatus.ACTIVE,
    });

    await employeeRepository.save(hrCoordinator);

    console.log('✅ Employees created');
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Admin: admin@hris.com / admin123');
    console.log('HR: hr@hris.com / hr123');
    console.log('Manager: emily.rodriguez@company.com / manager123');
    console.log('Employee: david.kim@company.com / employee123');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
