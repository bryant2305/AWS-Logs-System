import { Module } from '@nestjs/common';
import { CLogsController } from './c-logs.controller';
import { DynamoDBModule } from '../dynamodb/dynamodb.module';
import { SnsService } from '../sns/sns.service';
import { TopicArn } from 'src/modules/sns/topics/topicArn';

@Module({
  imports: [DynamoDBModule],
  controllers: [CLogsController],
  providers: [SnsService, TopicArn],
})
export class CLogsModule {}
