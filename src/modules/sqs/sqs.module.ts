import { Module } from '@nestjs/common';
import { SqsService } from './sqs.service';
import { SnsService } from 'src/modules/sns/sns.service';
import { TopicArn } from 'src/modules/sns/topics/topicArn';
@Module({
  providers: [SqsService, SnsService, TopicArn],
})
export class SqsModule {}
