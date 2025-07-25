// src/modules/dynamodb/dynamodb.module.ts
import { Module } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBService } from './dynamodb.service';

@Module({
  providers: [
    {
      provide: 'DYNAMODB_CLIENT',
      useFactory: () => {
        const client = new DynamoDBClient({ region: 'us-east-2' });
        return DynamoDBDocumentClient.from(client);
      },
    },
    DynamoDBService,
  ],
  exports: [DynamoDBService], // 🔁 exporta ambos
})
export class DynamoDBModule {}
