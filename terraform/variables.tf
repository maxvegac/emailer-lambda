variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project (used for resource naming)"
  type        = string
  default     = "emailer"
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    Project     = "emailer"
    Environment = "production"
    ManagedBy   = "terraform"
  }
}

# Lambda configuration
variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 30
}

variable "lambda_memory_size" {
  description = "Lambda function memory size in MB"
  type        = number
  default     = 256
}

# SMTP configuration
variable "smtp_host" {
  description = "SMTP server host"
  type        = string
  sensitive   = true
}

variable "smtp_port" {
  description = "SMTP server port"
  type        = number
  default     = 587
}

variable "smtp_secure" {
  description = "Whether to use secure SMTP connection"
  type        = bool
  default     = false
}

variable "smtp_user" {
  description = "SMTP username"
  type        = string
  sensitive   = true
}

variable "smtp_pass" {
  description = "SMTP password"
  type        = string
  sensitive   = true
}

variable "default_from_email" {
  description = "Default from email address"
  type        = string
}

# Lambda Function URL configuration
variable "function_url_cors_origins" {
  description = "CORS allowed origins for Lambda Function URL"
  type        = list(string)
  default     = ["*"]
}

# VPC configuration (optional)
variable "enable_vpc" {
  description = "Whether to deploy Lambda in VPC"
  type        = bool
  default     = false
}

variable "vpc_id" {
  description = "VPC ID for Lambda deployment"
  type        = string
  default     = ""
}

variable "subnet_ids" {
  description = "Subnet IDs for Lambda deployment"
  type        = list(string)
  default     = []
}

# Logging configuration
variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 14
}
