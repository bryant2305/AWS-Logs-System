import { Module } from '@nestjs/common';
import { SentryService } from './sentryWebHook.service';
import { SentryWebhookController } from './sentryWebHook.controller';
import { DynamoDBService } from 'src/dynamodb/dynamodb.service';
import { SnsService } from 'src/sns/sns.service';
import { DynamoDBModule } from 'src/dynamodb/dynamodb.module';
import { ConfigModule } from '@nestjs/config';
import { TopicArn } from 'src/sns/topics/topicArn';

@Module({
  imports: [ConfigModule.forRoot(), DynamoDBModule],
  controllers: [SentryWebhookController],
  providers: [DynamoDBService, SnsService, SentryService, TopicArn],
})
export class SentryWebSocketModule {}
