import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { RoleName } from '../../entities/role.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(RoleName.ADMIN, RoleName.HR)
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('roles')
  @Roles(RoleName.ADMIN)
  async getRoles() {
    return this.usersService.getAllRoles();
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.HR)
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id/role')
  @Roles(RoleName.ADMIN)
  async updateRole(@Param('id') id: string, @Body('roleId') roleId: string) {
    return this.usersService.updateRole(id, roleId);
  }

  @Put(':id/toggle-active')
  @Roles(RoleName.ADMIN)
  async toggleActive(@Param('id') id: string) {
    return this.usersService.toggleActive(id);
  }
}
