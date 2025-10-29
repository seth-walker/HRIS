import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from './employee.entity';

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

  @OneToMany(() => Employee, employee => employee.team)
  members: Employee[];

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
