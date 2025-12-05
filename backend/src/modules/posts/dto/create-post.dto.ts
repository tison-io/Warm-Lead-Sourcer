import { IsUrl, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { Platform } from '../../../common/interfaces/scraping.interface';

export class CreatePostDto {
  @IsUrl({}, { message: 'Please provide a valid URL' })
  @IsNotEmpty()
  url: string;

  @IsEnum(Platform)
  @IsOptional()
  platform?: Platform;
}
