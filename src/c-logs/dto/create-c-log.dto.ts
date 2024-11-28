import { IsString, IsISO8601, isNumber, IsNumber } from 'class-validator';

export class CreateCLogDto {
  @IsNumber()
  1: number;

  @IsString()
  id: string;

  @IsString()
  level: string;

  @IsString()
  message: string;

  @IsISO8601()
  timestamp: string;
}
