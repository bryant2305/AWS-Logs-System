import { Controller, Body, Post, Get, Query } from '@nestjs/common';
import { DynamoDBService } from 'src/modules/dynamodb/dynamodb.service';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateCLogDto } from './dto/create-c-log.dto';
import { SnsService } from 'src/modules/sns/sns.service';

@Controller('c-logs')
@ApiTags('c-logs')
export class CLogsController {
  constructor(
    private dynamoDBService: DynamoDBService,
    private readonly snsService: SnsService,
  ) {
    // 👇 AÑADE ESTE LOG DE DIAGNÓSTICO
    console.log(
      '✅ CONSTRUCTOR CLogsController: Inyección de dynamoDBService:',
      !!this.dynamoDBService,
    );
  }

  @Post('add-logs')
  @ApiBody({ type: CreateCLogDto })
  async addLog(@Body() log: CreateCLogDto) {
    console.log('Recibido log:', log);

    console.log('🧪 Tabla recibida:', process.env.LOGS_TABLE_NAME);
    console.log('🧪 dynamoDBService está definido?', !!this.dynamoDBService);
    console.log('Inyección de servicio:', this.dynamoDBService);
    console.log(
      'Metadata provider:',
      Reflect.getMetadataKeys(Object.getPrototypeOf(this)).map((k) =>
        Reflect.getMetadata(k, Object.getPrototypeOf(this)),
      ),
    );

    // 1. Guardar en DynamoDB
    await this.dynamoDBService.putItem(process.env.LOGS_TABLE_NAME, log);

    // 2. Publicar en el topic de logs
    await this.snsService.publishMessage(
      process.env.LOGS_TOPIC_ARN,
      JSON.stringify(log),
    );

    // 3. Si es error, notificar al usuario
    if (log.level === 'ERROR') {
      await this.snsService.notifyUser(log);
    }

    return { message: 'Log added successfully' };
  }

  @Get('get-logs')
  @ApiQuery({
    name: 'appId',
    required: false,
    description: 'Application identifier',
  })
  @ApiQuery({
    name: 'level',
    required: false,
    description: 'Log level (e.g., error, info)',
  })
  @ApiQuery({
    name: 'startTime',
    required: false,
    description: 'Start time for filtering logs',
  })
  @ApiQuery({
    name: 'endTime',
    required: false,
    description: 'End time for filtering logs',
  })
  async getLogs(
    @Query('appId') appId: string,
    @Query('level') level: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    const logs = await this.dynamoDBService.queryLogs(
      process.env.LOGS_TABLE_NAME,
      {
        appId,
        level,
        startTime,
        endTime,
      },
    );
    return logs;
  }
}
