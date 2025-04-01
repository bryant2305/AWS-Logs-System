import { Injectable } from '@nestjs/common';
import { SnsService } from 'src/sns/sns.service';
import { DynamoDBService } from 'src/dynamodb/dynamodb.service';
import { CreateCLogDto } from 'src/c-logs/dto/create-c-log.dto';
import { logLevel } from 'src/common/enums/log-level.enum';

@Injectable()
export class SentryService {
  constructor(
    private dynamoDBService: DynamoDBService,
    private readonly snsService: SnsService,
  ) {}

  async handleSentryEvent(event: any, resource: string) {
    console.log('📥 Recibido evento de Sentry:', event);

    if (resource === 'error') {
      console.log('🚨 Error detectado:', event.event);

      const log: CreateCLogDto = {
        id: event.event.id,
        level: logLevel.ERROR,
        message: event.event.message || 'Sin mensaje',
        timestamp: new Date().toISOString(),
      };

      // Guardamos el log en DynamoDB
      await this.dynamoDBService.putItem('Logs', log);

      // Publicamos el log en SNS
      await this.snsService.publishMessage(log.level, JSON.stringify(log));
    }
  }
}
