import { IsString, IsEmail, IsOptional, IsDate, IsNumber, IsEnum, IsUUID, ValidateIf } from 'class-validator';
import { Type, Transform } from 'class-transformer';
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

  @Transform(({ value }) => value === '' ? undefined : value)
  @ValidateIf((o) => o.email !== undefined && o.email !== null)
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @Transform(({ value }) => value === '' ? undefined : value)
  @ValidateIf((o) => o.managerId !== undefined && o.managerId !== null)
  @IsUUID()
  @IsOptional()
  managerId?: string;

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
