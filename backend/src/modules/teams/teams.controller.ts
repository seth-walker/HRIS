import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { RoleName } from '../../entities/role.entity';

@Controller('teams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Get()
  async findAll(@Query('search') search?: string) {
    return this.teamsService.findAll({ search });
  }

  @Get('hierarchy')
  async getHierarchy() {
    return this.teamsService.getTeamHierarchy();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @Post()
  @Roles(RoleName.ADMIN, RoleName.HR)
  async create(@Body() createTeamDto: CreateTeamDto, @CurrentUser() user: any) {
    return this.teamsService.create(createTeamDto, user.id);
  }

  @Put(':id')
  @Roles(RoleName.ADMIN, RoleName.HR)
  async update(
    @Param('id') id: string,
    @Body() updateTeamDto: UpdateTeamDto,
    @CurrentUser() user: any,
  ) {
    return this.teamsService.update(id, updateTeamDto, user.id);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.HR)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.teamsService.remove(id, user.id);
  }
}
