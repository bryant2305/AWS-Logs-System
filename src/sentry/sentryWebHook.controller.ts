import { Controller, Post, Body, Headers } from '@nestjs/common';
import { SentryService } from 'src/sentry/sentryWebHook.service';

@Controller('sentry-webhook')
export class SentryWebhookController {
  constructor(private readonly sentryService: SentryService) {}

  @Post()
  async handleSentryEvent(
    @Body() event: any,
    @Headers('x-sentry-hook-resource') resource: string,
  ) {
    await this.sentryService.handleSentryEvent(event, resource);
    return { message: 'Log recibido correctamente desde Sentry' };
  }
}
