import { Stack, StackProps, Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import path from 'path';

export class MyNestjsAppCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const stage = this.node.tryGetContext('stage') || 'dev';

    // 🟣 DynamoDB
    const logsTable = new dynamodb.Table(this, 'LogsTable', {
      tableName: 'LogsV2',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // 🟡 SNS Topics
    const logsTopic = new sns.Topic(this, 'LogsTopic', {
      topicName: `logs-topic-${stage}`,
      displayName: `Logs Topic for my-nestjs-app`,
    });

    const userNotificationsTopic = new sns.Topic(
      this,
      'UserNotificationsTopic',
      {
        topicName: `user-notifications-${stage}`,
        displayName: `User Notifications for my-nestjs-app`,
      },
    );

    // 🟢 SQS
    const logsQueue = new sqs.Queue(this, 'LogsSQSQueue', {
      queueName: `logs-queue-${stage}`,
      visibilityTimeout: Duration.seconds(30),
      retentionPeriod: Duration.days(14),
    });

    // 📩 Subscripción SNS → SQS
    logsTopic.addSubscription(
      new subs.SqsSubscription(logsQueue, {
        rawMessageDelivery: true,
      }),
    );

    // 🔐 Permisos para SNS → SQS (CDK lo maneja con SqsSubscription)

    // 🧠 Lambda
    const apiFn = new NodejsFunction(this, 'ApiLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 256,
      timeout: Duration.seconds(15),
      entry: '../../src/lambda.ts', // Usa `entry` en lugar de `code` para NodejsFunction
      handler: 'handler',
      bundling: {
        externalModules: [
          '@nestjs/microservices',
          '@nestjs/websockets',
          '@nestjs/websockets/socket-module',
          '@nestjs/microservices/microservices-module',
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

    // IAM para Lambda
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

    // 🌐 HTTP API Gateway
    const httpApi = new apigwv2.HttpApi(this, 'HttpApiGateway', {
      defaultIntegration: new integrations.HttpLambdaIntegration(
        'ApiIntegration',
        apiFn,
      ),
    });

    new cdk.CfnOutput(this, 'HttpApiUrl', {
      value: httpApi.url || 'No URL',
    });
  }
}
