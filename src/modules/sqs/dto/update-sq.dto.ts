import { PartialType } from '@nestjs/swagger';
import { CreateSqDto } from './create-sq.dto';

export class UpdateSqDto extends PartialType(CreateSqDto) {}
