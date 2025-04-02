import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SnsService } from './sns.service';
import { TopicArn } from './topics/topicArn';
import { SubscriptionsController } from './subscriptions-user-sns.controller';

@Module({
  controllers: [SubscriptionsController],
  imports: [ConfigModule.forRoot()],
  providers: [SnsService, TopicArn],
})
export class SnSModule {}
