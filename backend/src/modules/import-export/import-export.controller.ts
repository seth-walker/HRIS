import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ImportExportService } from './import-export.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { RoleName } from '../../entities/role.entity';

@Controller('import-export')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ImportExportController {
  constructor(private importExportService: ImportExportService) {}

  @Post('import/csv')
  @Roles(RoleName.ADMIN, RoleName.HR)
  @UseInterceptors(FileInterceptor('file'))
  async importCSV(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const csvContent = file.buffer.toString('utf-8');
    return this.importExportService.importEmployeesFromCSV(csvContent, user.id);
  }

  @Post('import/csv-text')
  @Roles(RoleName.ADMIN, RoleName.HR)
  async importCSVText(@Body('csvContent') csvContent: string, @CurrentUser() user: any) {
    if (!csvContent) {
      throw new BadRequestException('No CSV content provided');
    }
    return this.importExportService.importEmployeesFromCSV(csvContent, user.id);
  }

  @Get('export/employees/excel')
  @Roles(RoleName.ADMIN, RoleName.HR)
  async exportEmployeesExcel(
    @Query('department') department?: string,
    @Query('status') status?: string,
    @Res() res?: Response,
  ) {
    const buffer = await this.importExportService.exportEmployeesToExcel({
      department,
      status,
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=employees-${new Date().toISOString().split('T')[0]}.xlsx`,
    );

    res.send(buffer);
  }

  @Get('export/teams/excel')
  @Roles(RoleName.ADMIN, RoleName.HR)
  async exportTeamsExcel(@Res() res: Response) {
    const buffer = await this.importExportService.exportTeamsToExcel();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=teams-${new Date().toISOString().split('T')[0]}.xlsx`,
    );

    res.send(buffer);
  }

  @Get('export/org-chart/pdf')
  async exportOrgChartPDF(@Res() res: Response) {
    const buffer = await this.importExportService.exportOrgChartToPDF();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=org-chart-${new Date().toISOString().split('T')[0]}.pdf`,
    );

    res.send(buffer);
  }

  @Get('export/employees/pdf')
  async exportEmployeesPDF(
    @Query('department') department?: string,
    @Query('status') status?: string,
    @Res() res?: Response,
  ) {
    const buffer = await this.importExportService.exportEmployeeListToPDF({
      department,
      status,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=employees-${new Date().toISOString().split('T')[0]}.pdf`,
    );

    res.send(buffer);
  }

  @Get('template/csv')
  @Roles(RoleName.ADMIN, RoleName.HR)
  async downloadCSVTemplate(@Res() res: Response) {
    const csvContent = await this.importExportService.generateCSVTemplate();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=employee-template.csv');

    res.send(csvContent);
  }
}
