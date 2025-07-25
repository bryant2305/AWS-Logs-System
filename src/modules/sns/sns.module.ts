import { Module } from '@nestjs/common';
import { SnsService } from './sns.service';
import { TopicArn } from './topics/topicArn';
import { SubscriptionsController } from './subscriptions-user-sns.controller';

@Module({
  controllers: [SubscriptionsController],
  imports: [],
  providers: [SnsService, TopicArn],
})
export class SnSModule {}
