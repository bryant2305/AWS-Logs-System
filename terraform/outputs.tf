output "api_gateway_url" {
  description = "URL base para invocar la API."
  value       = aws_apigatewayv2_api.http_api.api_endpoint
}

output "lambda_function_name" {
  description = "Nombre de la función Lambda creada."
  value       = aws_lambda_function.nestjs_api.function_name
}

output "lambda_iam_role_arn" {
  description = "ARN del rol de IAM asignado a la Lambda."
  value       = aws_iam_role.lambda_role.arn
}

output "logs_table_name" {
  description = "Nombre de la tabla DynamoDB."
  value       = aws_dynamodb_table.logs_table.name
}

output "sqs_queue_url" {
  description = "URL de la cola SQS."
  value       = aws_sqs_queue.logs_queue.id
}
