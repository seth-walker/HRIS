import { IsString, IsOptional, IsUUID, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateTeamDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Transform(({ value }) => value === '' ? null : value)
  @ValidateIf((o) => o.leadId !== null)
  @IsUUID()
  @IsOptional()
  leadId?: string | null;

  @Transform(({ value }) => value === '' ? null : value)
  @ValidateIf((o) => o.parentTeamId !== null)
  @IsUUID()
  @IsOptional()
  parentTeamId?: string | null;
}
