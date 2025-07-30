variable "region" {
  description = "Región de AWS para desplegar los recursos."
  type        = string
  default     = "us-east-2"
}

variable "stage" {
  description = "Entorno de despliegue (dev, prod, etc.)."
  type        = string
  default     = "dev"
}

variable "logs_table_name" {
  description = "Nombre de la tabla DynamoDB para los logs."
  type        = string
  default     = "LogsV2"
}

variable "app_name" {
  description = "Nombre base para la aplicación y recursos."
  type        = string
  default     = "my-nestjs-app"
}
