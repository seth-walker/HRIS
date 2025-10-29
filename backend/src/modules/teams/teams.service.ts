import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Team } from '../../entities/team.entity';
import { AuditLog, AuditAction } from '../../entities/audit-log.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
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
      entityType: 'Team',
      entityId,
      changes,
    });
    await this.auditLogRepository.save(auditLog);
  }

  async findAll(filters?: { search?: string }): Promise<Team[]> {
    const where: any = {};

    if (filters?.search) {
      where.name = Like(`%${filters.search}%`);
    }

    return this.teamsRepository.find({
      where,
      relations: ['lead', 'members', 'parentTeam', 'subTeams'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Team> {
    const team = await this.teamsRepository.findOne({
      where: { id },
      relations: ['lead', 'members', 'parentTeam', 'subTeams'],
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

    Object.assign(team, updateTeamDto);
    const updatedTeam = await this.teamsRepository.save(team);

    await this.createAuditLog(userId, AuditAction.UPDATE, id, {
      old: oldData,
      new: updateTeamDto,
    });

    return this.findOne(updatedTeam.id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const team = await this.teamsRepository.findOne({ where: { id } });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    await this.createAuditLog(userId, AuditAction.DELETE, id, {
      deletedTeam: team,
    });

    await this.teamsRepository.remove(team);
  }

  async getTeamHierarchy(): Promise<any> {
    const teams = await this.teamsRepository.find({
      relations: ['lead', 'members', 'parentTeam', 'subTeams'],
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
          memberCount: team.members?.length || 0,
          subTeams: buildTree(team.id),
        }));
    };

    return buildTree(null);
  }
}
