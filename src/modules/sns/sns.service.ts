import { Injectable } from '@nestjs/common';
import {
  SNSClient,
  PublishCommand,
  SubscribeCommand,
} from '@aws-sdk/client-sns';

@Injectable()
export class SnsService {
  private snsClient: SNSClient;

  constructor() {
    this.snsClient = new SNSClient({
      region: 'us-east-2',
      logger: console,
    });
  }

  async publishMessage(topicArn: string, message: string) {
    try {
      const command = new PublishCommand({
        TopicArn: topicArn,
        Message: message,
      });

      const response = await this.snsClient.send(command);
      return response;
    } catch (error) {
      console.error('Error al publicar mensaje en SNS:', error);
      throw error;
    }
  }

  async notifyUser(log: any) {
    const userArn = process.env.USER_NOTIFICATIONS_TOPIC_ARN;

    if (!userArn) {
      throw new Error(
        'USER_NOTIFICATIONS_TOPIC_ARN no está definido en las variables de entorno',
      );
    }

    try {
      await this.publishMessage(
        userArn,
        JSON.stringify({
          default: `Alerta de error: ${log.message}`,
          email: `🚨 Alerta de error: ${log.message}`,
          sms: `Error: ${log.message}`,
        }),
      );
    } catch (error) {
      console.error('Error al notificar al usuario:', error);
      throw error;
    }
  }
  async subscribeToUserNotifications(protocol: string, endpoint: string) {
    try {
      const command = new SubscribeCommand({
        TopicArn: process.env.USER_NOTIFICATIONS_TOPIC_ARN,
        Protocol: protocol,
        Endpoint: endpoint,
      });

      const response = await this.snsClient.send(command);
      return {
        message: 'Suscripción exitosa',
        subscriptionArn: response.SubscriptionArn,
      };
    } catch (error) {
      console.error('Error al suscribir usuario:', error);
      throw error;
    }
  }
}
