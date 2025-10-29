import { IsString, IsEmail, IsOptional, IsDate, IsNumber, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { EmploymentStatus } from '../../../entities/employee.entity';

export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsUUID()
  @IsOptional()
  managerId?: string;

  @IsUUID()
  @IsOptional()
  teamId?: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  hireDate?: Date;

  @IsNumber()
  @IsOptional()
  salary?: number;

  @IsEnum(EmploymentStatus)
  @IsOptional()
  status?: EmploymentStatus;
}
