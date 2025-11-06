import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from './employee.entity';
import { EmployeeTeamMembership } from './employee-team-membership.entity';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Employee, employee => employee.teamsLed, { nullable: true })
  @JoinColumn({ name: 'leadId' })
  lead: Employee;

  @Column({ nullable: true })
  leadId: string;

  // Many-to-many relationship with employees through junction table
  @OneToMany(() => EmployeeTeamMembership, membership => membership.team)
  teamMemberships: EmployeeTeamMembership[];

  @ManyToOne(() => Team, team => team.subTeams, { nullable: true })
  @JoinColumn({ name: 'parentTeamId' })
  parentTeam: Team;

  @Column({ nullable: true })
  parentTeamId: string;

  @OneToMany(() => Team, team => team.parentTeam)
  subTeams: Team[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
