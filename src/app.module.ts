import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CLogsModule } from './c-logs/c-logs.module';
import { DynamoDBModule } from './dynamodb/dynamodb.module';
import { SentryModule } from '@sentry/nestjs/setup';
import { SentryWebSocketModule } from './sentry/sentryWebHook.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SentryModule.forRoot(),
    CLogsModule,
    DynamoDBModule,
    SentryWebSocketModule,
  ],
  providers: [AppService],
})
export class AppModule {}
