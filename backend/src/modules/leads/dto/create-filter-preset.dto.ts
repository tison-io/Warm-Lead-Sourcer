import { IsString, IsObject, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateFilterPresetDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @IsObject()
  @IsNotEmpty()
  filters!: Record<string, any>;
}
