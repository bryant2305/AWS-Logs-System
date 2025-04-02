import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class TopicArn {
  constructor(private readonly configService: ConfigService) {}
  public getTopicArnByLogType(logType: string): string | undefined {
    const topicMap = {
      ERROR: this.configService.get<string>('SNS_ERROR_TOPIC_ARN'),
      WARNING: this.configService.get<string>('SNS_WARNING_TOPIC_ARN'),
      INFO: this.configService.get<string>('SNS_INFO_TOPIC_ARN'),
    };

    return topicMap[logType] || undefined;
  }
}
