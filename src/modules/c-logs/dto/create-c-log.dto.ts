import { IsString, IsISO8601, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { logLevel } from 'src/common/enums/log-level.enum';

export class CreateCLogDto {
  @ApiProperty({
    example: 123,
    description: 'Identificador numérico único del log',
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    example: logLevel.ERROR,
    description: 'Nivel del log',
    enum: logLevel,
  })
  @IsString()
  @IsEnum(logLevel)
  level: logLevel;

  @ApiProperty({
    example: 'Se produjo un error al procesar la solicitud',
    description: 'Mensaje descriptivo del log',
  })
  @IsString()
  message: string;

  @ApiProperty({
    example: '2025-07-15T18:25:43.511Z',
    description: 'Fecha y hora del evento en formato ISO8601',
    format: 'date-time',
  })
  @IsISO8601()
  timestamp: string;
}
