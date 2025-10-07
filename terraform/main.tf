terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Data source for current AWS account
data "aws_caller_identity" "current" {}

# Data source for current AWS region
data "aws_region" "current" {}

# IAM role for Lambda function
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

# IAM policy for Lambda basic execution
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# IAM policy for Lambda to access VPC (if needed)
resource "aws_iam_role_policy_attachment" "lambda_vpc_access" {
  count      = var.enable_vpc ? 1 : 0
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# Archive the source code
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../dist"
  output_path = "${path.module}/lambda_function.zip"
  depends_on  = [null_resource.build]
}

# Build the TypeScript project
resource "null_resource" "build" {
  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    command = "cd ${path.module}/.. && npm run build"
  }
}

# Lambda function
resource "aws_lambda_function" "emailer" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "${var.project_name}-emailer"
  role            = aws_iam_role.lambda_role.arn
  handler         = "lambda.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime         = "nodejs22.x"
  timeout         = var.lambda_timeout
  memory_size     = var.lambda_memory_size

  environment {
    variables = {
      SMTP_HOST        = var.smtp_host
      SMTP_PORT        = var.smtp_port
      SMTP_SECURE      = var.smtp_secure
      SMTP_USER        = var.smtp_user
      SMTP_PASS        = var.smtp_pass
      DEFAULT_FROM_EMAIL = var.default_from_email
    }
  }

  vpc_config {
    subnet_ids         = var.enable_vpc ? var.subnet_ids : []
    security_group_ids = var.enable_vpc ? [aws_security_group.lambda_sg[0].id] : []
  }

  tags = var.tags
}

# Security group for Lambda (if VPC is enabled)
resource "aws_security_group" "lambda_sg" {
  count       = var.enable_vpc ? 1 : 0
  name        = "${var.project_name}-lambda-sg"
  description = "Security group for emailer Lambda function"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-lambda-sg"
  })
}

# Lambda Function URL
resource "aws_lambda_function_url" "emailer_url" {
  function_name      = aws_lambda_function.emailer.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = false
    allow_origins     = ["*"]
    allow_methods     = ["POST", "OPTIONS"]
    allow_headers     = ["date", "keep-alive"]
    expose_headers    = ["date", "keep-alive"]
    max_age          = 86400
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${aws_lambda_function.emailer.function_name}"
  retention_in_days = var.log_retention_days

  tags = var.tags
}
