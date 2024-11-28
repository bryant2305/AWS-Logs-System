import { Controller, Body, Post } from '@nestjs/common';
import { CLogsService } from './c-logs.service';
import { DynamoDBService } from 'src/dynamodb/dynamodb.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
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
}
