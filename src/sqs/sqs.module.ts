import { Module } from '@nestjs/common';
import { SqsService } from './sqs.service';
import { SnsService } from 'src/sns/sns.service';
import { TopicArn } from 'src/sns/topics/topicArn';
@Module({
  providers: [SqsService, SnsService, TopicArn],
})
export class SqsModule {}
