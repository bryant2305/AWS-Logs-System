import { Module } from '@nestjs/common';
import { CLogsService } from './c-logs.service';
import { CLogsController } from './c-logs.controller';
import { DynamoDBService } from 'src/dynamodb/dynamodb.service';
import { DynamoDBModule } from 'src/dynamodb/dynamodb.module';

@Module({
  imports: [DynamoDBModule],
  controllers: [CLogsController],
  providers: [CLogsService, DynamoDBService],
})
export class CLogsModule {}
