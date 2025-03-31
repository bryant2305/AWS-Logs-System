import { Module } from '@nestjs/common';
import { CLogsController } from './c-logs.controller';
import { DynamoDBService } from '../dynamodb/dynamodb.service';
import { DynamoDBModule } from '../dynamodb/dynamodb.module';
import { SnsService } from '../sns/sns.service';
import { ConfigModule } from '@nestjs/config';
import { TopicArn } from 'src/sns/topics/topicArn';

@Module({
  imports: [ConfigModule.forRoot(), DynamoDBModule],
  controllers: [CLogsController],
  providers: [DynamoDBService, SnsService, TopicArn],
})
export class CLogsModule {}
