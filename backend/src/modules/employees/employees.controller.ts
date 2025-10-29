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
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { RoleName } from '../../entities/role.entity';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private employeesService: EmployeesService) {}

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Query('department') department?: string,
    @Query('status') status?: string,
    @Query('title') title?: string,
    @Query('search') search?: string,
    @Query('teamId') teamId?: string,
    @Query('managerId') managerId?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    return this.employeesService.findAll(user, {
      department,
      status,
      title,
      search,
      teamId,
      managerId,
      sortBy,
      sortOrder,
    });
  }

  @Get('org-chart')
  async getOrgChart() {
    return this.employeesService.getOrgChart();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.employeesService.findOne(id, user);
  }

  @Get(':id/direct-reports')
  @Roles(RoleName.ADMIN, RoleName.HR, RoleName.MANAGER)
  async getDirectReports(@Param('id') id: string) {
    return this.employeesService.getDirectReports(id);
  }

  @Post()
  @Roles(RoleName.ADMIN, RoleName.HR)
  async create(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @CurrentUser() user: any,
  ) {
    return this.employeesService.create(createEmployeeDto, user.id);
  }

  @Post('bulk-import')
  @Roles(RoleName.ADMIN, RoleName.HR)
  async bulkImport(
    @Body() employeesData: CreateEmployeeDto[],
    @CurrentUser() user: any,
  ) {
    return this.employeesService.bulkImport(employeesData, user.id);
  }

  @Put(':id')
  @Roles(RoleName.ADMIN, RoleName.HR, RoleName.MANAGER)
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @CurrentUser() user: any,
  ) {
    return this.employeesService.update(id, updateEmployeeDto, user);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.HR)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.employeesService.remove(id, user.id);
  }
}
