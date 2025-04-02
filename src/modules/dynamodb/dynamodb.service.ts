import { Inject, Injectable } from '@nestjs/common';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DynamoDBService {
  constructor(
    @Inject('DYNAMODB_CLIENT')
    private readonly dynamoDbClient: DynamoDBDocumentClient,
  ) {}

  async putItem(tableName: string, item: Record<string, any>) {
    const command = new PutCommand({
      TableName: tableName,
      Item: item,
    });
    return this.dynamoDbClient.send(command);
  }

  async scanTable(tableName: string) {
    const command = new ScanCommand({ TableName: tableName });
    return this.dynamoDbClient.send(command);
  }

  async queryLogs(
    tableName: string,
    filters: {
      appId?: string;
      level?: string;
      startTime?: string;
      endTime?: string;
    },
  ) {
    const { appId, level, startTime, endTime } = filters;

    // Inicializa los parámetros
    const params: any = {
      TableName: tableName,
      ExpressionAttributeValues: {},
      ExpressionAttributeNames: {},
    };

    const filterExpressions: string[] = [];

    // Si `appId` está definido
    if (appId) {
      params.KeyConditionExpression = '#id = :id';
      params.ExpressionAttributeNames['#id'] = 'id'; // Mapea a tu clave primaria
      params.ExpressionAttributeValues[':id'] = parseInt(appId, 10); // Si es número
    }

    // Filtro por `level`
    if (level) {
      filterExpressions.push('#level = :level'); // Usa alias
      params.ExpressionAttributeNames['#level'] = 'level'; // Alias para nivel
      params.ExpressionAttributeValues[':level'] = level;
    }

    // Filtro por rango de tiempo
    if (startTime && endTime) {
      filterExpressions.push('#timestamp BETWEEN :startTime AND :endTime');
      params.ExpressionAttributeNames['#timestamp'] = 'timestamp'; // Evitar conflicto con nombres reservados
      params.ExpressionAttributeValues[':startTime'] = startTime;
      params.ExpressionAttributeValues[':endTime'] = endTime;
    }

    // Agrega las expresiones de filtro si existen
    if (filterExpressions.length > 0) {
      params.FilterExpression = filterExpressions.join(' AND ');
    }

    // Limpia `ExpressionAttributeNames` y `ExpressionAttributeValues` si están vacíos
    if (Object.keys(params.ExpressionAttributeNames).length === 0) {
      delete params.ExpressionAttributeNames;
    }
    if (Object.keys(params.ExpressionAttributeValues).length === 0) {
      delete params.ExpressionAttributeValues;
    }

    // Usa `QueryCommand` o `ScanCommand` dependiendo de `appId`
    const command = appId ? new QueryCommand(params) : new ScanCommand(params);
    return this.dynamoDbClient.send(command);
  }
}
