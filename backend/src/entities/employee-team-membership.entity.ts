import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from './employee.entity';
import { Team } from './team.entity';

@Entity('employee_team_memberships')
export class EmployeeTeamMembership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Employee, employee => employee.teamMemberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column()
  employeeId: string;

  @ManyToOne(() => Team, team => team.teamMemberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @Column()
  teamId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
