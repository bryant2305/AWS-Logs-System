import { Injectable } from '@nestjs/common';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

@Injectable()
export class SnsService {
  private snsClient: SNSClient;
  private topicArn = process.env.SNS_TOPIC_ARN;

  constructor() {
    console.log('SNS_TOPIC_ARN:', process.env.SNS_TOPIC_ARN);
    this.snsClient = new SNSClient({ region: 'us-east-2' });
  }

  async publishMessage(message: string) {
    const params = {
      Message: message,
      TopicArn: this.topicArn,
    };

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
