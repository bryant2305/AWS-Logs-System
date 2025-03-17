import { Injectable } from '@nestjs/common';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { TopicArn } from './topics/topicArn';

@Injectable()
export class SnsService {
  private snsClient: SNSClient;
  constructor(private topicArn: TopicArn) {
    this.snsClient = new SNSClient({ region: 'us-east-2' });
  }

  async publishMessage(logType: string, message: string) {
    const topicArn = this.topicArn.getTopicArnByLogType(logType);

    if (!topicArn) {
      throw new Error('No se pudo encontrar el ARN de la topic');
    }
    const params = {
      Message: JSON.stringify({ logType, message }),
      TopicArn: topicArn,
    };

    try {
      const command = new PublishCommand(params);
      const response = await this.snsClient.send(command);
      return response;
    } catch (error) {
      console.error('Error al publicar en SNS:', error);
      throw error;
    }
  }
}
