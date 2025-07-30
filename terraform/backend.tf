terraform {
  backend "s3" {
    bucket         = "my-logs-test-state-bucket"
    key            = "nestjs-app/terraform.tfstate"
    region         = "us-east-2"
    dynamodb_table = "terraform-lock-table"
    encrypt        = true
  }
}
