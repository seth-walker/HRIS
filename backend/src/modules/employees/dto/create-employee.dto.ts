import { IsString, IsEmail, IsOptional, IsDate, IsNumber, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { EmploymentStatus } from '../../../entities/employee.entity';

export class CreateEmployeeDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  title: string;

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
  hireDate: Date;

  @IsNumber()
  @IsOptional()
  salary?: number;

  @IsEnum(EmploymentStatus)
  @IsOptional()
  status?: EmploymentStatus;
}
