import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Employee } from '../../entities/employee.entity';
import { Team } from '../../entities/team.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { ImportExportService } from './import-export.service';
import { ImportExportController } from './import-export.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, Team, AuditLog]),
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  ],
  providers: [ImportExportService],
  controllers: [ImportExportController],
  exports: [ImportExportService],
})
export class ImportExportModule {}
