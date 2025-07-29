// lib/my-nestjs-app-cdk-stack.ts
import {
  Stack,
  StackProps,
  Duration,
  RemovalPolicy,
  CfnOutput,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

export class MyNestjsAppCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const stage = this.node.tryGetContext('stage') || 'dev';

    // DynamoDB
    const logsTable = new dynamodb.Table(this, 'LogsTable', {
      tableName: 'LogsV2',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // SNS Topics
    const logsTopic = new sns.Topic(this, 'LogsTopic', {
      topicName: `logs-topic-${stage}`,
      displayName: 'Logs Topic for my-nestjs-app',
    });

    const userNotificationsTopic = new sns.Topic(
      this,
      'UserNotificationsTopic',
      {
        topicName: `user-notifications-${stage}`,
        displayName: 'User Notifications for my-nestjs-app',
      },
    );

    // SQS Queue
    const logsQueue = new sqs.Queue(this, 'LogsSQSQueue', {
      queueName: `logs-queue-${stage}`,
      visibilityTimeout: Duration.seconds(30),
      retentionPeriod: Duration.days(14),
    });

    // SNS → SQS subscription
    logsTopic.addSubscription(
      new subs.SqsSubscription(logsQueue, {
        rawMessageDelivery: true,
      }),
    );

    // Lambda
    const apiFn = new NodejsFunction(this, 'ApiLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 256,
      timeout: Duration.seconds(15),
      entry: path.join(__dirname, '../../src/lambda.ts'), // <-- ✅ usa path.join
      handler: 'handler',
      bundling: {
        externalModules: [
          '@nestjs/microservices',
          '@nestjs/websockets',
          'class-transformer/storage',
        ],
      },
      environment: {
        LOGS_TABLE_NAME: logsTable.tableName,
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
        SQS_QUEUE_URL: logsQueue.queueUrl,
        USER_NOTIFICATIONS_TOPIC_ARN: userNotificationsTopic.topicArn,
        LOGS_TOPIC_ARN: logsTopic.topicArn,
      },
    });

    // Permisos
    logsTable.grantReadWriteData(apiFn);
    logsQueue.grantSendMessages(apiFn);
    logsQueue.grantConsumeMessages(apiFn);
    logsTopic.grantPublish(apiFn);
    userNotificationsTopic.grantPublish(apiFn);

    apiFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['sqs:ListQueues'],
        resources: ['*'],
      }),
    );

    // API Gateway
    const httpApi = new apigwv2.HttpApi(this, 'HttpApiGateway', {
      defaultIntegration: new integrations.HttpLambdaIntegration(
        'ApiIntegration',
        apiFn,
      ),
    });

    new CfnOutput(this, 'HttpApiUrl', {
      value: httpApi.url ?? 'No URL',
    });
  }
}
