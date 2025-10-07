output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.emailer.function_name
}

output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.emailer.arn
}

output "lambda_function_url" {
  description = "URL of the Lambda Function URL"
  value       = aws_lambda_function_url.emailer_url.function_url
}

output "cloudwatch_log_group_name" {
  description = "Name of the CloudWatch log group"
  value       = aws_cloudwatch_log_group.lambda_logs.name
}

output "iam_role_arn" {
  description = "ARN of the Lambda IAM role"
  value       = aws_iam_role.lambda_role.arn
}
