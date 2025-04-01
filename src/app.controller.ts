import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('docs')
  getDocsDebug() {
    return { message: 'Swagger docs route is accessible!' };
  }
  @Get('/debug-sentry')
  getError() {
    throw new Error('My first Sentry error!');
  }
}
