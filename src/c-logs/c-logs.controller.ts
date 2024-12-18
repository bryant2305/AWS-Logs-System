import { Controller, Body, Post, Get, Query } from '@nestjs/common';
import { CLogsService } from './c-logs.service';
import { DynamoDBService } from 'src/dynamodb/dynamodb.service';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateCLogDto } from './dto/create-c-log.dto';

@Controller('c-logs')
@ApiTags('c-logs')
export class CLogsController {
  constructor(
    private readonly cLogsService: CLogsService,
    private dynamoDBService: DynamoDBService,
  ) {}

  @Post('add-logs')
  @ApiBody({ type: CreateCLogDto })
  async addLog(@Body() log: CreateCLogDto) {
    await this.dynamoDBService.putItem('Logs', log);
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
    const logs = await this.dynamoDBService.queryLogs('Logs', {
      appId,
      level,
      startTime,
      endTime,
    });
    return logs;
  }
}
