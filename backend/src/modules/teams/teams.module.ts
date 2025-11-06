import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from '../../entities/team.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { EmployeeTeamMembership } from '../../entities/employee-team-membership.entity';
import { Employee } from '../../entities/employee.entity';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Team, AuditLog, EmployeeTeamMembership, Employee])],
  providers: [TeamsService],
  controllers: [TeamsController],
  exports: [TeamsService],
})
export class TeamsModule {}
