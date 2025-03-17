import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SnsService } from './sns.service';
import { TopicArn } from './topics/topicArn';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [SnsService, TopicArn],
})
export class SnSModule {}
