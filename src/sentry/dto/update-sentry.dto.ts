import { PartialType } from '@nestjs/swagger';
import { CreateSentryDto } from './create-sentry.dto';

export class UpdateSentryDto extends PartialType(CreateSentryDto) {}
