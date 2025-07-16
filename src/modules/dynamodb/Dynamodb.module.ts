import { Module } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

@Module({
  providers: [
    {
      provide: 'DYNAMODB_CLIENT',
      useFactory: () => {
        const client = new DynamoDBClient({
          region: 'us-east-2',
          ...(process.env.AWS_ACCESS_KEY_ID &&
          process.env.AWS_SECRET_ACCESS_KEY &&
          process.env.AWS_SESSION_TOKEN
            ? {
                credentials: {
                  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                  sessionToken: process.env.AWS_SESSION_TOKEN,
                },
              }
            : {
                // Si no hay credenciales temporales, usa las credenciales por defecto
                credentials: {
                  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                },
              }),
        });

        return DynamoDBDocumentClient.from(client);
      },
    },
  ],
  exports: ['DYNAMODB_CLIENT'],
})
export class DynamoDBModule {}
 