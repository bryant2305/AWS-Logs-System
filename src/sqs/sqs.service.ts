import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { SnsService } from 'src/sns/sns.service';

@Injectable()
export class SqsService implements OnModuleInit {
  private readonly logger = new Logger(SqsService.name);
  private sqsClient: SQSClient;
  private queueUrl: string;

  constructor(private readonly snsService: SnsService) {
    this.sqsClient = new SQSClient({ region: 'us-east-2' });
    this.queueUrl = process.env.SQS_QUEUE_URL;
  }

  async onModuleInit() {
    this.logger.log(`Iniciando sondeo de la cola SQS: ${this.queueUrl}`);
    this.pollQueue().catch((err) => {
      this.logger.error('Error en el sondeo de la cola SQS', err);
    });
  }

  private async pollQueue() {
    while (true) {
      try {
        const response = await this.sqsClient.send(
          new ReceiveMessageCommand({
            QueueUrl: this.queueUrl,
            MaxNumberOfMessages: 5,
            WaitTimeSeconds: 10,
            MessageAttributeNames: ['All'],
          }),
        );

        if (response.Messages && response.Messages.length > 0) {
          this.logger.log(`Mensajes recibidos: ${response.Messages.length}`);

          await Promise.all(
            response.Messages.map(async (message) => {
              try {
                await this.processMessage(message);
              } catch (error) {
                this.logger.error('Error procesando mensaje', error);
              }
            }),
          );
        }
      } catch (error) {
        this.logger.error('Error al recibir mensajes de SQS', error);
        // Esperar antes de reintentar para evitar bucle rápido de errores
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  private async processMessage(message: any) {
    try {
      const body = JSON.parse(message.Body);
      // SNS envía el mensaje en un campo "Message"
      const snsMessage = JSON.parse(body.Message || '{}');

      this.logger.debug('Contenido del mensaje:', snsMessage);

      if (snsMessage.level === 'ERROR') {
        await this.snsService.notifyUser(snsMessage);
      }

      await this.deleteMessage(message.ReceiptHandle);
    } catch (error) {
      this.logger.error('Error al parsear mensaje', error);
      throw error;
    }
  }

  private async deleteMessage(receiptHandle: string) {
    try {
      await this.sqsClient.send(
        new DeleteMessageCommand({
          QueueUrl: this.queueUrl,
          ReceiptHandle: receiptHandle,
        }),
      );
      this.logger.debug('Mensaje eliminado de la cola');
    } catch (error) {
      this.logger.error('Error al eliminar mensaje de SQS', error);
      throw error;
    }
  }
}
