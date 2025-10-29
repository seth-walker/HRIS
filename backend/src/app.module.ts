import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { TeamsModule } from './modules/teams/teams.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { ImportExportModule } from './modules/import-export/import-export.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'hris_user',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_DATABASE || 'hris_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV === 'development', // Only for development
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    UsersModule,
    EmployeesModule,
    TeamsModule,
    AuditLogModule,
    ImportExportModule,
  ],
})
export class AppModule {}
