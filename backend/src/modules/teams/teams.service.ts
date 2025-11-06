import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../../entities/team.entity';
import { AuditLog, AuditAction } from '../../entities/audit-log.entity';
import { EmployeeTeamMembership } from '../../entities/employee-team-membership.entity';
import { Employee } from '../../entities/employee.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(EmployeeTeamMembership)
    private membershipRepository: Repository<EmployeeTeamMembership>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
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
      entityType: 'Team',
      entityId,
      changes,
    });
    await this.auditLogRepository.save(auditLog);
  }

  async findAll(filters?: { search?: string }): Promise<Team[]> {
    const queryBuilder = this.teamsRepository
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.lead', 'lead')
      .leftJoinAndSelect('team.parentTeam', 'parentTeam')
      .leftJoinAndSelect('team.subTeams', 'subTeams')
      .leftJoinAndSelect('team.teamMemberships', 'teamMemberships')
      .leftJoinAndSelect('teamMemberships.employee', 'employee');

    // Case-insensitive search across team name and description
    if (filters?.search) {
      queryBuilder.where(
        '(team.name ILIKE :search OR team.description ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    queryBuilder.orderBy('team.name', 'ASC');

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Team> {
    const team = await this.teamsRepository.findOne({
      where: { id },
      relations: ['lead', 'parentTeam', 'subTeams', 'teamMemberships', 'teamMemberships.employee'],
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  async create(createTeamDto: CreateTeamDto, userId: string): Promise<Team> {
    const team = this.teamsRepository.create(createTeamDto);
    const savedTeam = await this.teamsRepository.save(team);

    await this.createAuditLog(userId, AuditAction.CREATE, savedTeam.id, {
      data: createTeamDto,
    });

    return this.findOne(savedTeam.id);
  }

  async update(
    id: string,
    updateTeamDto: UpdateTeamDto,
    userId: string,
  ): Promise<Team> {
    const team = await this.findOne(id);
    const oldData = { ...team };

    console.log('=== UPDATE TEAM DEBUG ===');
    console.log('Team ID:', id);
    console.log('Update DTO:', JSON.stringify(updateTeamDto, null, 2));
    console.log('Old parentTeamId:', team.parentTeamId);
    console.log('Has parentTeamId in DTO:', 'parentTeamId' in updateTeamDto);
    console.log('New parentTeamId value:', updateTeamDto.parentTeamId);

    console.log('Team object before save:', {
      id: team.id,
      name: team.name,
      parentTeamId: team.parentTeamId,
    });

    // Explicitly handle each field to ensure null and undefined values are properly applied
    // Both null and undefined should update the field (null clears it in the database)
    if (updateTeamDto.name !== undefined) {
      team.name = updateTeamDto.name;
    }
    if (updateTeamDto.description !== undefined) {
      team.description = updateTeamDto.description;
    }
    if ('leadId' in updateTeamDto) {
      team.leadId = updateTeamDto.leadId;
      // Clear the relation object to force TypeORM to use the ID
      delete team.lead;
    }
    if ('parentTeamId' in updateTeamDto) {
      team.parentTeamId = updateTeamDto.parentTeamId;
      // Clear the relation object to force TypeORM to use the ID
      delete team.parentTeam;
      console.log('Setting parentTeamId to:', updateTeamDto.parentTeamId);
    }

    const updatedTeam = await this.teamsRepository.save(team);

    console.log('Team object after save:', {
      id: updatedTeam.id,
      name: updatedTeam.name,
      parentTeamId: updatedTeam.parentTeamId,
    });
    console.log('=== END UPDATE DEBUG ===');

    await this.createAuditLog(userId, AuditAction.UPDATE, id, {
      old: oldData,
      new: updateTeamDto,
    });

    return this.findOne(updatedTeam.id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const team = await this.teamsRepository.findOne({
      where: { id },
      relations: ['subTeams'],
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // If this team has subteams, reassign them to this team's parent (or null)
    if (team.subTeams && team.subTeams.length > 0) {
      await this.teamsRepository
        .createQueryBuilder()
        .update(Team)
        .set({ parentTeamId: team.parentTeamId })
        .where('parentTeamId = :teamId', { teamId: id })
        .execute();
    }

    await this.createAuditLog(userId, AuditAction.DELETE, id, {
      deletedTeam: team,
      reassignedSubteams: team.subTeams?.length || 0,
      newParentId: team.parentTeamId,
    });

    await this.teamsRepository.remove(team);
  }

  async getTeamHierarchy(): Promise<any> {
    const teams = await this.teamsRepository.find({
      relations: ['lead', 'parentTeam', 'subTeams', 'teamMemberships', 'teamMemberships.employee'],
      order: { name: 'ASC' },
    });

    // Build tree structure starting from top-level teams (no parent)
    const buildTree = (parentTeamId: string | null): any[] => {
      return teams
        .filter((team) => team.parentTeamId === parentTeamId)
        .map((team) => ({
          id: team.id,
          name: team.name,
          description: team.description,
          lead: team.lead
            ? {
                id: team.lead.id,
                name: `${team.lead.firstName} ${team.lead.lastName}`,
                title: team.lead.title,
              }
            : null,
          memberCount: team.teamMemberships?.length || 0,
          subTeams: buildTree(team.id),
        }));
    };

    return buildTree(null);
  }

  async addTeamMember(teamId: string, employeeId: string, userId: string): Promise<EmployeeTeamMembership> {
    // Verify team exists
    const team = await this.teamsRepository.findOne({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Verify employee exists
    const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Check if membership already exists
    const existingMembership = await this.membershipRepository.findOne({
      where: { teamId, employeeId },
    });

    if (existingMembership) {
      throw new ConflictException('Employee is already a member of this team');
    }

    // Create membership
    const membership = this.membershipRepository.create({ teamId, employeeId });
    const savedMembership = await this.membershipRepository.save(membership);

    await this.createAuditLog(userId, AuditAction.UPDATE, teamId, {
      action: 'add_member',
      employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
    });

    return savedMembership;
  }

  async removeTeamMember(teamId: string, employeeId: string, userId: string): Promise<void> {
    const membership = await this.membershipRepository.findOne({
      where: { teamId, employeeId },
      relations: ['employee'],
    });

    if (!membership) {
      throw new NotFoundException('Team membership not found');
    }

    await this.membershipRepository.remove(membership);

    await this.createAuditLog(userId, AuditAction.UPDATE, teamId, {
      action: 'remove_member',
      employeeId,
      employeeName: `${membership.employee.firstName} ${membership.employee.lastName}`,
    });
  }

  async getTeamMembers(teamId: string): Promise<Employee[]> {
    const team = await this.teamsRepository.findOne({
      where: { id: teamId },
      relations: ['teamMemberships', 'teamMemberships.employee'],
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Return all team members from the junction table
    return team.teamMemberships?.map(m => m.employee) || [];
  }
}
