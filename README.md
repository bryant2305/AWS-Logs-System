# AWS Logs System

A serverless logging system built with **NestJS**, **AWS SNS**, **SQS**, and **DynamoDB**. This system receives logs, processes them through SNS and SQS, and notifies users in case of critical errors. Designed for **scalability, reliability, and real-time error alerting**.

## Features
- **NestJS Backend**: Handles incoming logs and manages AWS services.
- **AWS SNS & SQS**: Asynchronous message processing and user notifications.
- **DynamoDB Storage**: Stores log records efficiently.
- **Serverless Deployment**: Uses AWS Lambda and Serverless Framework.

## Architecture
1. Logs are received through a **REST API**.
2. The logs are stored in **DynamoDB**.
3. A log message is published to an **SNS topic**.
4. The SNS topic sends messages to an **SQS queue**.
5. The SQS queue triggers processing and, if the log is an error, an alert is sent to subscribed users via SNS.

## Installation

### Prerequisites
- **Node.js** (v18+)
- **AWS CLI** (configured with your credentials)
- **Serverless Framework**

### Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/bryant2305/AWS-Logs-System.git
   cd aws-logs-system
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables in a `.env` file:
   ```env
   AWS_REGION=us-east-2
   SQS_QUEUE_URL=your-sqs-queue-url
   USER_NOTIFICATIONS_TOPIC_ARN=your-sns-topic-arn
   LOGS_TOPIC_ARN=your-logs-sns-topic-arn
   ```
4. Deploy the service:
   ```sh
   npx serverless deploy
   ```

## Usage
### API Endpoints
- **Add a log:**
  ```http
  POST /api/c-logs/add-logs
  ```
  **Body Example:**
  ```json
  {
    "id": 123,
    "level": "ERROR",
    "message": "An unexpected error occurred.",
    "timestamp": "2025-01-14T12:34:56Z"
  }
  ```

- **Get logs:**
  ```http
  GET /api/c-logs/get-logs?appId=123&level=ERROR
  ```

- **Subscribe a user to notifications:**
  ```http
  POST /api/subscriptions/subscribe
  ```
  **Body Example:**
  ```json
  {
    "protocol": "SMS",
    "endpoint": "+18294322305"
  }
  ```

## Technologies Used
- **NestJS**
- **AWS SNS & SQS**
- **DynamoDB**
- **Serverless Framework**


---
Made with ❤️ using AWS & NestJS 🚀

