import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CLogsModule } from './modules/c-logs/c-logs.module';
import { DynamoDBModule } from './modules/dynamodb/dynamodb.module';
import { SqsModule } from './modules/sqs/sqs.module';
import { SnSModule } from './modules/sns/sns.module';

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
