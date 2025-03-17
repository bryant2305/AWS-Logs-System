import { Module } from '@nestjs/common';
import { CLogsService } from './c-logs.service';
import { CLogsController } from './c-logs.controller';
import { DynamoDBService } from '../dynamodb/dynamodb.service';
import { DynamoDBModule } from '../dynamodb/dynamodb.module';
import { SnsService } from '../sns/sns.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), DynamoDBModule],
  controllers: [CLogsController],
  providers: [CLogsService, DynamoDBService, SnsService],
})
export class CLogsModule {}
