import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { Team } from './team.entity';
import { User } from './user.entity';
import { EmployeeTeamMembership } from './employee-team-membership.entity';

export enum EmploymentStatus {
  ACTIVE = 'active',
  ON_LEAVE = 'on_leave',
  TERMINATED = 'terminated',
}

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @ManyToOne(() => Employee, employee => employee.directReports, { nullable: true })
  @JoinColumn({ name: 'managerId' })
  manager: Employee;

  @Column({ nullable: true })
  managerId: string;

  @OneToMany(() => Employee, employee => employee.manager)
  directReports: Employee[];

  @OneToMany(() => Team, team => team.lead)
  teamsLed: Team[];

  // Many-to-many relationship with teams through junction table
  @OneToMany(() => EmployeeTeamMembership, membership => membership.employee)
  teamMemberships: EmployeeTeamMembership[];

  @Column({ type: 'date' })
  hireDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salary: number;

  @Column({
    type: 'enum',
    enum: EmploymentStatus,
    default: EmploymentStatus.ACTIVE,
  })
  status: EmploymentStatus;

  @OneToOne(() => User, user => user.employee, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
