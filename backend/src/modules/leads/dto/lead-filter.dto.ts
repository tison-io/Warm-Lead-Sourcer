import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class LeadFilterDto {
  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  university?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minEngagements?: number;
}
