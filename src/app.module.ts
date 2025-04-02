import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CLogsModule } from './c-logs/c-logs.module';
import { DynamoDBModule } from './dynamodb/dynamodb.module';
import { SqsModule } from './sqs/sqs.module';
import { SnSModule } from './sns/sns.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CLogsModule,
    DynamoDBModule,
    SqsModule,
    SnSModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
