import { IsString, IsEmail, IsOptional, IsDate, IsNumber, IsEnum, IsUUID, ValidateIf } from 'class-validator';
import { Type, Transform } from 'class-transformer';
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

  @Transform(({ value }) => value === '' ? undefined : value)
  @ValidateIf((o) => o.managerId !== undefined && o.managerId !== null)
  @IsUUID()
  @IsOptional()
  managerId?: string;

  @Transform(({ value }) => value === '' ? undefined : value)
  @ValidateIf((o) => o.teamId !== undefined && o.teamId !== null)
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
