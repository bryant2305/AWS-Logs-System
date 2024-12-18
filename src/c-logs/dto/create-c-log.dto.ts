import { IsString, IsISO8601, isNumber, IsNumber, isEnum, IsEnum } from 'class-validator';
import { logLevel } from 'src/common/enums/log-level.enum';

export class CreateCLogDto {
  @IsNumber()
  id: number;

  @IsString()
  @IsEnum(logLevel)
  level: logLevel;

  @IsString()
  message: string;

  @IsISO8601()
  timestamp: string;
}
