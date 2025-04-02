import { PartialType } from '@nestjs/swagger';
import { CreateCLogDto } from './create-c-log.dto';

export class UpdateCLogDto extends PartialType(CreateCLogDto) {}
