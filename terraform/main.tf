# Bucket S3 para almacenar el código de la Lambda
resource "aws_s3_bucket" "lambda_bucket" {
  bucket = "lambda-deploy-${var.app_name}-${var.stage}-${var.region}"
}

# Objeto S3 que contiene el paquete ZIP de la aplicacion
resource "aws_s3_object" "lambda_zip" {
  bucket = aws_s3_bucket.lambda_bucket.id
  key    = "function-code.zip"
  source = "build/function-code.zip" # ✅ CORREGIDO: Asumimos que el zip está en la raíz
  etag   = filemd5("build/function-code.zip")
}

# DynamoDB Table para logs
resource "aws_dynamodb_table" "logs_table" {
  name         = var.logs_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = {
    Environment = var.stage
    Application = var.app_name
  }
}

# SNS Topic para logs
resource "aws_sns_topic" "logs_topic" {
  name = "logs-topic-${var.stage}"
  tags = {
    Environment = var.stage
    Application = var.app_name
  }
}

# SNS Topic para notificaciones de usuario
resource "aws_sns_topic" "user_notifications" {
  name = "user-notifications-${var.stage}"
  tags = {
    Environment = var.stage
    Application = var.app_name
  }
}

# SQS Queue para procesar logs
resource "aws_sqs_queue" "logs_queue" {
  name                      = "logs-queue-${var.stage}"
  visibility_timeout_seconds = 30
  message_retention_seconds  = 1209600 # 14 días
  tags = {
    Environment = var.stage
    Application = var.app_name
  }
}

# Política de la cola SQS para permitir mensajes desde el SNS Topic de logs
resource "aws_sqs_queue_policy" "logs_policy" {
  queue_url = aws_sqs_queue.logs_queue.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "sns.amazonaws.com" }
        Action    = "sqs:SendMessage"
        Resource  = aws_sqs_queue.logs_queue.arn
        Condition = {
          ArnEquals = { "aws:SourceArn" = aws_sns_topic.logs_topic.arn }
        }
      }
    ]
  })
}

# Suscripción de la cola SQS al SNS Topic
resource "aws_sns_topic_subscription" "logs_subscription" {
  topic_arn = aws_sns_topic.logs_topic.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.logs_queue.arn
}

# Rol de IAM para la función Lambda
resource "aws_iam_role" "lambda_role" {
  name = "${var.app_name}-lambda-role-${var.stage}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action    = "sts:AssumeRole",
      Effect    = "Allow",
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })

  tags = {
    Environment = var.stage
    Application = var.app_name
  }
}

# Política de IAM con los permisos para la Lambda
resource "aws_iam_policy" "lambda_policy" {
  name        = "${var.app_name}-lambda-policy-${var.stage}"
  description = "Política de permisos para la Lambda de ${var.app_name}"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect   = "Allow",
        Action   = [
          "dynamodb:PutItem", "dynamodb:Scan", "dynamodb:Query",
          "dynamodb:GetItem", "dynamodb:UpdateItem", "dynamodb:DeleteItem"
        ],
        Resource = [
          aws_dynamodb_table.logs_table.arn,
          "${aws_dynamodb_table.logs_table.arn}/index/*"
        ]
      },
      {
        Effect   = "Allow",
        Action   = "sns:Publish",
        Resource = [aws_sns_topic.logs_topic.arn, aws_sns_topic.user_notifications.arn]
      },
      {
        Effect   = "Allow",
        Action   = "sqs:*",
        Resource = aws_sqs_queue.logs_queue.arn
      },
      {
        Effect   = "Allow",
        Action   = "sqs:ListQueues",
        Resource = "*"
      }
    ]
  })
}

# Adjuntar la política personalizada al rol de la Lambda
resource "aws_iam_role_policy_attachment" "custom_policy" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}

# Adjuntar política para logs de CloudWatch
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Layer
resource "aws_lambda_layer_version" "nestjs_dependencies" {
  layer_name        = "my-nestjs-app-dependencies"
  filename          = "build/dependencies.zip" # ✅ CORREGIDO: Asumimos que el zip está en la raíz
  source_code_hash  = filebase64sha256("build/dependencies.zip")
  compatible_runtimes = ["nodejs20.x"]
}

# Función Lambda
resource "aws_lambda_function" "nestjs_api" {
  function_name = "${var.app_name}-${var.stage}"
  
  # ✅ CORREGIDO: Usamos solo S3 para el código fuente
  s3_bucket        = aws_s3_bucket.lambda_bucket.id
  s3_key           = aws_s3_object.lambda_zip.key
  
  # ❌ ELIMINADO: Se quitan 'filename' y 'source_code_hash' para evitar conflicto
  # filename         = "function-code.zip"
  source_code_hash = aws_s3_object.lambda_zip.etag
  
  handler          = "lambda.handler" # ✅ CORREGIDO: La ruta del handler es ahora correcta
  runtime          = "nodejs20.x"     # ✅ CORREGIDO: El runtime debe coincidir con la capa
  role             = aws_iam_role.lambda_role.arn
  timeout          = 15
  memory_size      = 256
  architectures    = ["arm64"]
  layers = [aws_lambda_layer_version.nestjs_dependencies.arn]

  environment {
    variables = {
      LOGS_TABLE_NAME              = var.logs_table_name
      SQS_QUEUE_URL                = aws_sqs_queue.logs_queue.id
      USER_NOTIFICATIONS_TOPIC_ARN = aws_sns_topic.user_notifications.arn
      LOGS_TOPIC_ARN               = aws_sns_topic.logs_topic.arn
      AWS_NODEJS_CONNECTION_REUSE_ENABLED = "1"
      STAGE                        = var.stage
      REGION                       = var.region
    }
  }

  tags = {
    Environment = var.stage
    Application = var.app_name
  }
}

# API Gateway (HTTP API)
resource "aws_apigatewayv2_api" "http_api" {
  name          = "${var.app_name}-http-api-${var.stage}"
  protocol_type = "HTTP"
  description   = "API Gateway para la aplicación ${var.app_name}"
  tags = {
    Environment = var.stage
    Application = var.app_name
  }
}

# Integración entre API Gateway y la función Lambda
resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id                 = aws_apigatewayv2_api.http_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.nestjs_api.invoke_arn
  payload_format_version = "2.0"
}

# Ruta "catch-all" que dirige todo el tráfico a la Lambda
resource "aws_apigatewayv2_route" "default_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# Etapa de despliegue para la API
resource "aws_apigatewayv2_stage" "default_stage" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true
}

# Permiso de invocación para API Gateway
resource "aws_lambda_permission" "api_gw_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.nestjs_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}