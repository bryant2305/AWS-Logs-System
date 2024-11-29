import { IsString, IsISO8601, isNumber, IsNumber } from 'class-validator';

export class CreateCLogDto {
  @IsNumber()
  id: number;

  @IsString()
  level: string;

  @IsString()
  message: string;

  @IsISO8601()
  timestamp: string;
}
