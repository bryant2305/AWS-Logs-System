import { Injectable } from '@nestjs/common';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SnsService {
  private snsClient: SNSClient;
  constructor(private readonly configService: ConfigService) {
    this.snsClient = new SNSClient({ region: 'us-east-2' });
  }

  async publishMessage(message: string) {
    const topicArn = this.configService
      .get<string>('SNS_TOPIC_ARN', '')
      .toString();

    const params = {
      Message: message,
      TopicArn: topicArn,
    };
    console.log('process.env.SNS_TOPIC_ARN:', process.env.SNS_TOPIC_ARN);
    console.log(
      'configService SNS_TOPIC_ARN:',
      this.configService.get('SNS_TOPIC_ARN'),
    );

    try {
      const command = new PublishCommand(params);
      const response = await this.snsClient.send(command);
      console.log('Mensaje publicado en SNS:', response);
      return response;
    } catch (error) {
      console.error('Error al publicar en SNS:', error);
      throw error;
    }
  }
}
