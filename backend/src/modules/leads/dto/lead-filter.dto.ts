import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

enum EngagementType {
  LIKE = 'like',
  COMMENT = 'comment',
  SHARE = 'share',
  REACTION = 'reaction',
}

enum SortField {
  MATCH_SCORE = 'matchScore',
  NAME = 'name',
  CREATED_AT = 'createdAt',
}

enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

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
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  minScore?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  maxScore?: number;

  @IsOptional()
  @IsEnum(EngagementType)
  engagementType?: EngagementType;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsEnum(SortField)
  sortBy?: SortField;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  skip?: number;
}
