# AWS Logs System

Un sistema serverless de logging construido con **NestJS**, **AWS Lambda**, **API Gateway**, **SNS**, **SQS** y **DynamoDB**. Recibe logs vía API REST, los almacena en DynamoDB, publica eventos en SNS y procesa notificaciones y colas con SQS. El despliegue se realiza usando **Terraform** y GitHub Actions.

## Características
- **NestJS Backend**: API REST modular y robusta.
- **AWS Lambda**: Backend serverless empaquetado con Webpack/esbuild.
- **API Gateway**: Exposición HTTP segura y escalable.
- **SNS & SQS**: Procesamiento asíncrono y notificaciones a usuarios.
- **DynamoDB**: Almacenamiento eficiente de logs.
- **Infraestructura como código**: Todo gestionado con Terraform.
- **CI/CD**: Pipeline automatizado con GitHub Actions.

## Arquitectura
1. **API Gateway** recibe logs y los envía a Lambda.
2. **Lambda** (NestJS) almacena logs en DynamoDB y publica eventos en SNS.
3. **SNS** reenvía mensajes a una cola SQS y a un topic de notificaciones.
4. **SQS** permite procesamiento asíncrono de logs críticos.
5. **Notificaciones**: Si el log es de tipo ERROR, SNS notifica a los usuarios suscritos.

## Instalación

### Prerrequisitos
- **Node.js** (v20+)
- **AWS CLI** (configurado)
- **Terraform** (v1.6+)
- **Yarn** (recomendado)

### Setup local
1. Clona el repositorio:
   ```sh
   git clone https://github.com/bryant2305/AWS-Logs-System.git
   cd AWS-Logs-System
   ```
2. Instala dependencias:
   ```sh
   yarn install
   ```
3. Crea un archivo `.env` en la raíz con tus variables:
   ```env
   AWS_REGION=us-east-2
   SQS_QUEUE_URL=your-sqs-queue-url
   USER_NOTIFICATIONS_TOPIC_ARN=your-sns-topic-arn
   LOGS_TOPIC_ARN=your-logs-sns-topic-arn
   ```
4. Compila el proyecto:
   ```sh
   yarn build
   ```
5. Ejecuta localmente (opcional):
   ```sh
   yarn start:dev
   ```

### Despliegue en AWS

1. Inicializa y aplica Terraform:
   ```sh
   cd terraform
   terraform init
   terraform apply
   ```
2. Sube los artefactos (`dist`, capas y dependencias) a S3 según lo definido en los scripts de CI/CD.
3. Terraform creará:
   - Lambda function
   - API Gateway
   - DynamoDB, SNS, SQS
   - Roles y permisos necesarios

### CI/CD

- El pipeline de GitHub Actions:
  - Compila el código y empaqueta con Webpack/esbuild.
  - Genera los archivos ZIP para Lambda y sus dependencias.
  - Sube los artefactos a S3.
  - Ejecuta Terraform para desplegar la infraestructura.

## Uso

### Endpoints principales

- **Agregar un log:**
  ```http
  POST /api/c-logs/add-logs
  ```
  **Body ejemplo:**
  ```json
  {
    "id": 123,
    "level": "ERROR",
    "message": "An unexpected error occurred.",
    "timestamp": "2025-01-14T12:34:56Z"
  }
  ```

- **Consultar logs:**
  ```http
  GET /api/c-logs/get-logs?appId=123&level=ERROR
  ```

- **Suscribir usuario a notificaciones:**
  ```http
  POST /api/subscriptions/subscribe
  ```
  **Body ejemplo:**
  ```json
  {
    "protocol": "EMAIL",
    "endpoint": "bryantperezgarcia005@gmail.com"
  }
  ```

## Tecnologías principales
- **NestJS** (API y lógica de negocio)
- **AWS Lambda** (serverless backend)
- **API Gateway** (exposición HTTP)
- **DynamoDB** (almacenamiento NoSQL)
- **SNS & SQS** (mensajería y notificaciones)
- **Terraform** (infraestructura como código)
- **GitHub Actions** (CI/CD)

---

Made with ❤️ using AWS, NestJS & Terraform 🚀